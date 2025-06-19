import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Subscription, Attendance } from '@/types';

export class FirebaseService {
  // Users Collection
  static async getUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  static async getUserByCredentials(username: string, password: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('name', '==', username),
        where('password', '==', password)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by credentials:', error);
      throw error;
    }
  }

  static async getUserByQR(qrCode: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('qrCode', '==', qrCode));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by QR:', error);
      throw error;
    }
  }

  static async addUser(userData: Omit<User, 'id'>): Promise<string> {
    try {
      const usersRef = collection(db, 'users');
      const docRef = await addDoc(usersRef, {
        ...userData,
        createdAt: Timestamp.now(),
        subscriptionStatus: 'pending'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Subscriptions Collection
  static async getSubscriptions(): Promise<Subscription[]> {
    try {
      const subsRef = collection(db, 'subscriptions');
      const snapshot = await getDocs(subsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Subscription));
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      throw error;
    }
  }

  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const subsRef = collection(db, 'subscriptions');
      const q = query(
        subsRef, 
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('endDate', 'desc')
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Subscription;
      }
      return null;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  static async addSubscription(subscriptionData: Omit<Subscription, 'id'>): Promise<string> {
    try {
      const subsRef = collection(db, 'subscriptions');
      const docRef = await addDoc(subsRef, {
        ...subscriptionData,
        createdAt: Timestamp.now()
      });

      // Update user subscription status
      await this.updateUser(subscriptionData.userId, {
        subscriptionStatus: 'active'
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<void> {
    try {
      const subRef = doc(db, 'subscriptions', subscriptionId);
      await updateDoc(subRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Attendance Collection
  static async getAttendance(): Promise<Attendance[]> {
    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, orderBy('date', 'desc'), orderBy('time', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attendance));
    } catch (error) {
      console.error('Error getting attendance:', error);
      throw error;
    }
  }

  static async recordAttendance(attendanceData: Omit<Attendance, 'id'>): Promise<string> {
    try {
      const attendanceRef = collection(db, 'attendance');
      const docRef = await addDoc(attendanceRef, {
        ...attendanceData,
        createdAt: Timestamp.now(),
        synced: true
      });
      return docRef.id;
    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  }

  static async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef, 
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        orderBy('time', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attendance));
    } catch (error) {
      console.error('Error getting user attendance:', error);
      throw error;
    }
  }

  static async getAttendanceByDate(date: string): Promise<Attendance[]> {
    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef, 
        where('date', '==', date),
        orderBy('time', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attendance));
    } catch (error) {
      console.error('Error getting attendance by date:', error);
      throw error;
    }
  }

  // Real-time listeners
  static subscribeToUsers(callback: (users: User[]) => void) {
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      callback(users);
    });
  }

  static subscribeToAttendance(callback: (attendance: Attendance[]) => void) {
    const attendanceRef = collection(db, 'attendance');
    const q = query(attendanceRef, orderBy('date', 'desc'), orderBy('time', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const attendance = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attendance));
      callback(attendance);
    });
  }

  // Pending users (waiting for admin approval)
  static async getPendingUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('subscriptionStatus', '==', 'pending'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error getting pending users:', error);
      throw error;
    }
  }

  static async approveUser(userId: string, subscriptionData: Omit<Subscription, 'id' | 'userId'>): Promise<void> {
    try {
      // Add subscription
      await this.addSubscription({
        ...subscriptionData,
        userId
      });

      // Update user status
      await this.updateUser(userId, {
        subscriptionStatus: 'active'
      });
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }
}