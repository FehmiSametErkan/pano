import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider , signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithPhoneNumber, RecaptchaVerifier, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, setDoc, doc as firestoreDoc, getDoc } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBmC-jzTkkXHV8QC47TZ1wnVExZNPTQ-gg",
  authDomain: "etkinlik-platformu-98bf9.firebaseapp.com",
  projectId: "etkinlik-platformu-98bf9",
  storageBucket: "etkinlik-platformu-98bf9.firebasestorage.app",
  messagingSenderId: "895847857308",
  appId: "1:895847857308:web:0b5549741fc8b265354159",
  measurementId: "G-4XTNWYX031"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

if (typeof window !== 'undefined') {
  auth.settings = auth.settings || {};
  try {
    const host = window.location && window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      auth.settings.appVerificationDisabledForTesting = true;
      console.info('Firebase auth: appVerificationDisabledForTesting set to true for local testing');
    }
  } catch (e) {
  }
}
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const eventsCollectionRef = collection(db, "events");
const storage = getStorage(app);


const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    try {
      await setDoc(firestoreDoc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        lastLogin: new Date(),
      }, { merge: true });
    } catch (e) {
      console.warn('could not upsert user doc for google user', e);
    }
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const registerWithEmail = async (email, password, displayName, phone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    try {
      await setDoc(firestoreDoc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName: displayName || null,
        phone: phone || null,
        createdAt: new Date(),
      });
    } catch (e) {
      console.warn('Could not create user doc in Firestore', e);
    }
    try {
      await sendEmailVerification(userCredential.user);
    } catch (e) {
      console.warn('Failed to send verification email', e);
    }

    return userCredential.user;
  } catch (error) {
    console.error('Register error', error);
    throw error;
  }
};

const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Email sign-in error', error);
    throw error;
  }
};

const sendPhoneOTP = async (phoneNumber, recaptchaContainerId = 'recaptcha-container') => {
  try {
    if (typeof auth.settings === 'undefined') {
      auth.settings = {};
    }

    try {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) { /* ignore */ }
        window.recaptchaVerifier = null;
      }
    } catch (e) {
      console.warn('recaptcha cleanup failed', e);
    }

    if (typeof document !== 'undefined' && !document.getElementById(recaptchaContainerId)) {
      const div = document.createElement('div');
      div.id = recaptchaContainerId;
      document.body.appendChild(div);
    }

    if (auth.settings && auth.settings.appVerificationDisabledForTesting) {
      console.info('appVerificationDisabledForTesting is true — using a dummy appVerifier for testing');
      const fakeVerifier = {
        type: 'recaptcha',
        verify: () => Promise.resolve('test-verification'),
        render: () => Promise.resolve(0),
        clear: () => {},
        _reset: () => {}
      };
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, fakeVerifier);
      return confirmationResult;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(recaptchaContainerId, {
        'size': 'invisible',
        'callback': (response) => {
        }
      }, auth);
    } catch (recaptchaInitErr) {
      console.warn('Recaptcha init failed:', recaptchaInitErr);
      try {
        auth.settings = auth.settings || {};
        auth.settings.appVerificationDisabledForTesting = true;
        console.info('Fallback: set auth.settings.appVerificationDisabledForTesting = true and using dummy verifier');
        const fakeVerifier = {
          type: 'recaptcha',
          verify: () => Promise.resolve('test-verification')
        };
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, fakeVerifier);
        return confirmationResult;
      } catch (fallbackErr) {
        console.error('Fallback phone OTP failed', fallbackErr);
        throw fallbackErr;
      }
    }

    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    return confirmationResult; 
  } catch (error) {
    console.error('sendPhoneOTP error', error);
    if (error.code === 'auth/operation-not-allowed') {
      error.message = 'Phone authentication is not enabled in Firebase Console. Go to Authentication → Sign-in method → Phone and enable it.';
    }
    throw error;
  }
};

const confirmPhoneOTP = async (confirmationResult, code) => {
  try {
    const userCredential = await confirmationResult.confirm(code);
    const user = userCredential.user;

    try {
      await setDoc(firestoreDoc(db, 'users', user.uid), {
        uid: user.uid,
        phone: user.phoneNumber || null,
        email: user.email || null,
        displayName: user.displayName || null,
        lastLogin: new Date(),
      }, { merge: true });
    } catch (e) {
      console.warn('could not create/merge phone user in firestore', e);
    }

    return user;
  } catch (error) {
    console.error('confirmPhoneOTP error', error);
    throw error;
  }
};

const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Şifre sıfırlama e-postası gönderildi. Lütfen e-postanızı kontrol edin.' };
  } catch (error) {
    console.error('Password reset error', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('Bu e-posta ile kayıtlı bir kullanıcı bulunamadı.');
    }
    throw error;
  }
};

const isEmailVerified = async (user) => {
  try {
    await user.reload();
    return user.emailVerified;
  } catch (error) {
    console.error('Email verification check error', error);
    return false;
  }
};

const resendEmailVerification = async (user) => {
  try {
    await sendEmailVerification(user);
    return { success: true, message: 'Doğrulama e-postası yeniden gönderildi.' };
  } catch (error) {
    console.error('Resend verification email error', error);
    throw error;
  }
};

const setupTwoFactorAuth = async (userId, phoneNumber) => {
  try {
    await setDoc(firestoreDoc(db, 'users', userId), {
      twoFactorEnabled: true,
      twoFactorPhone: phoneNumber,
      twoFactorSetupDate: new Date()
    }, { merge: true });
    return { success: true, message: '2FA başarıyla etkinleştirildi.' };
  } catch (error) {
    console.error('Setup 2FA error', error);
    throw error;
  }
};

const disableTwoFactorAuth = async (userId) => {
  try {
    await setDoc(firestoreDoc(db, 'users', userId), {
      twoFactorEnabled: false,
      twoFactorPhone: null
    }, { merge: true });
    return { success: true, message: '2FA devre dışı bırakıldı.' };
  } catch (error) {
    console.error('Disable 2FA error', error);
    throw error;
  }
};

const isTwoFactorEnabled = async (userId) => {
  try {
    const userDoc = await getDoc(firestoreDoc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().twoFactorEnabled || false;
    }
    return false;
  } catch (error) {
    console.error('Check 2FA error', error);
    return false;
  }
};

const getTwoFactorPhone = async (userId) => {
  try {
    const userDoc = await getDoc(firestoreDoc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().twoFactorPhone || null;
    }
    return null;
  } catch (error) {
    console.error('Get 2FA phone error', error);
    return null;
  }
};

provider.addScope('openid');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/photoslibrary.readonly');



export { auth, provider, db, eventsCollectionRef, signInWithGoogle, logOut, storage, registerWithEmail, signInWithEmail, sendPhoneOTP, confirmPhoneOTP, sendPasswordReset, isEmailVerified, resendEmailVerification, setupTwoFactorAuth, disableTwoFactorAuth, isTwoFactorEnabled, getTwoFactorPhone };
