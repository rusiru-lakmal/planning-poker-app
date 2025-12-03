import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebaseConfig';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp, orderBy } from 'firebase/firestore';
import React, { useState } from 'react';
import { 
  Modal, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  Alert
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface InviteUsersModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

interface UserResult {
  id: string;
  name: string;
  email: string;
  expoPushToken?: string;
}

export const InviteUsersModal: React.FC<InviteUsersModalProps> = ({
  visible,
  onClose,
  roomId,
  roomName,
}) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const term = searchQuery.toLowerCase();
    setLoading(true);
    try {
      
      // Search by email (exact match)
      const emailQuery = query(
        collection(db, 'users'), 
        where('email', '==', term)
      );
      
      // Search by name (prefix match using nameLower)
      // This is more reliable than array-contains for prefix search
      const nameQuery = query(
        collection(db, 'users'),
        orderBy('nameLower'),
        where('nameLower', '>=', term),
        where('nameLower', '<=', term + '\uf8ff'),
        limit(10)
      );

      const [emailSnap, nameSnap] = await Promise.all([
        getDocs(emailQuery),
        getDocs(nameQuery)
      ]);

      const results = new Map<string, UserResult>();

      emailSnap.forEach(doc => {
        if (doc.id !== user?.id) {
          results.set(doc.id, { id: doc.id, ...doc.data() } as UserResult);
        }
      });

      nameSnap.forEach(doc => {
        if (doc.id !== user?.id) {
          results.set(doc.id, { id: doc.id, ...doc.data() } as UserResult);
        }
      });

      setSearchResults(Array.from(results.values()));
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to array-contains if index is missing for orderBy
      try {
        const keywordQuery = query(
          collection(db, 'users'),
          where('searchKeywords', 'array-contains', searchQuery.toLowerCase()),
          limit(10)
        );
        const keywordSnap = await getDocs(keywordQuery);
        const results = new Map<string, UserResult>();
        keywordSnap.forEach(doc => {
          if (doc.id !== user?.id) {
            results.set(doc.id, { id: doc.id, ...doc.data() } as UserResult);
          }
        });
        setSearchResults(Array.from(results.values()));
      } catch (fallbackError) {
        console.error("Fallback search error:", fallbackError);
        
        // Final fallback: Client-side filtering (Brute Force)
        // This is necessary for legacy users who haven't logged in to get 'nameLower' or 'searchKeywords'
        try {
          console.log("Attempting client-side fallback search for term:", term);
          const allUsersQuery = query(collection(db, 'users'), limit(50));
          const allUsersSnap = await getDocs(allUsersQuery);
          console.log(`Fallback fetched ${allUsersSnap.size} users`);
          
          const results = new Map<string, UserResult>();
          
          allUsersSnap.forEach(doc => {
            if (doc.id !== user?.id) {
              const userData = doc.data();
              console.log("Checking user:", userData.name, userData.email);
              const name = userData.name || '';
              const email = userData.email || '';
              
              if (
                name.toLowerCase().includes(term) || 
                email.toLowerCase().includes(term)
              ) {
                results.set(doc.id, { id: doc.id, ...userData } as UserResult);
              }
            }
          });
          setSearchResults(Array.from(results.values()));
        } catch (finalError) {
          console.error("Final fallback error:", finalError);
          Alert.alert("Error", "Failed to search users");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = async () => {
    setLoading(true);
    try {
      console.log("[Debug] Starting to fetch users from Firestore...");
      const q = query(collection(db, 'users'), limit(20));
      const snapshot = await getDocs(q);
      console.log(`[Debug] Query completed. Snapshot size: ${snapshot.size}, empty: ${snapshot.empty}`);
      
      const results: UserResult[] = [];
      snapshot.forEach(doc => {
        // Include current user for debugging purposes
        const data = doc.data();
        const isMe = doc.id === user?.id;
        console.log(`[Debug] Found user doc: ${doc.id}, name: ${data.name}`);
        results.push({ 
          id: doc.id, 
          ...data,
          name: isMe ? `${data.name} (You)` : data.name
        } as UserResult);
      });
      console.log(`[Debug] Fetched ${results.length} users`);
      if (results.length === 0) {
        Alert.alert("Debug Info", `Found 0 users. Total docs: ${snapshot.size}. My ID: ${user?.id}\n\nThis likely means:\n1. No users in database yet\n2. Firestore security rules are blocking access\n\nCheck Firebase Console > Firestore > Rules`);
      }
      setSearchResults(results);
    } catch (error: any) {
      console.error("Show all error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      Alert.alert("Permission Error?", 
        `Error: ${error.message}\n\nCode: ${error.code}\n\nIf this says 'permission-denied', you need to update your Firestore Security Rules in the Firebase Console.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSendInvites = async () => {
    if (selectedUsers.size === 0) return;

    setSending(true);
    try {
      const promises = Array.from(selectedUsers).map(async (recipientId) => {
        const recipient = searchResults.find(u => u.id === recipientId);
        if (!recipient) return;

        // Create notification in Firestore
        await addDoc(collection(db, 'users', recipientId, 'notifications'), {
          type: 'invite',
          title: 'Planning Poker Invite',
          body: `${user?.name} invited you to join "${roomName}"`,
          data: { roomId },
          senderId: user?.id,
          senderName: user?.name,
          read: false,
          createdAt: serverTimestamp()
        });

        // Trigger push notification via Expo Push API (from client)
        if (recipient.expoPushToken) {
          await sendPushNotification(recipient.expoPushToken, roomName, roomId);
        }
      });

      await Promise.all(promises);
      
      Alert.alert("Success", `Invites sent to ${selectedUsers.size} users!`);
      onClose();
      setSelectedUsers(new Set());
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error("Send invite error:", error);
      Alert.alert("Error", "Failed to send invites");
    } finally {
      setSending(false);
    }
  };

  const sendPushNotification = async (expoPushToken: string, roomName: string, roomId: string) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Planning Poker Invite',
      body: `${user?.name} invited you to join "${roomName}"`,
      data: { roomId },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      <View style={styles.modalContainer} pointerEvents="box-none">
        <Pressable style={{flex: 1}} onPress={onClose} />
        <Animated.View entering={FadeIn.delay(100)} style={styles.content}>
          <LinearGradient
            colors={currentTheme.colors.cardBg as any}
            style={styles.contentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Invite Users</Text>
              <Text style={styles.subtitle}>Search by name or email</Text>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.input, { borderColor: currentTheme.colors.accent }]}
                placeholder="Search users..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <Button 
                title={loading ? "..." : "Search"} 
                onPress={handleSearch} 
                style={styles.searchButton}
                disabled={loading}
              />
            </View>
            
            <Button 
              title="Show All Users (Debug)" 
              onPress={handleShowAll} 
              variant="outline"
              style={{ marginBottom: 10 }}
            />

            <ScrollView style={styles.resultsList}>
              {searchResults.map((result) => (
                <Pressable
                  key={result.id}
                  onPress={() => toggleUser(result.id)}
                  style={[
                    styles.userItem,
                    selectedUsers.has(result.id) && { 
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      borderColor: currentTheme.colors.accent 
                    }
                  ]}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{result.name}</Text>
                    <Text style={styles.userEmail}>{result.email}</Text>
                  </View>
                  {selectedUsers.has(result.id) && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </Pressable>
              ))}
              {searchResults.length === 0 && searchQuery && !loading && (
                <Text style={styles.emptyText}>No users found</Text>
              )}
            </ScrollView>

            <View style={styles.actions}>
              <Button 
                title="Cancel" 
                onPress={onClose} 
                variant="outline" 
                style={styles.button} 
              />
              <Button 
                title={sending ? "Sending..." : `Invite (${selectedUsers.size})`}
                onPress={handleSendInvites} 
                style={styles.button}
                disabled={selectedUsers.size === 0 || sending}
              />
            </View>
          </LinearGradient>
        </Animated.View>
        <Pressable style={{flex: 1}} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '80%',
    width: '100%',
  },
  contentGradient: {
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchButton: {
    width: 80,
  },
  resultsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkIcon: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
