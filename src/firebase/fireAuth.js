import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  sendPasswordResetEmail,
} from "firebase/auth";
import { setUserDetails } from "./fireStore";
import { uploadProfilePhoto } from "./storage";

const createUser = async (email, password, username, phone) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    if (username)
      await updateProfile(auth.currentUser, {
        displayName: username,
      });
    await setUserDetails(auth.currentUser.uid, email, username, phone);
  } catch (err) {
    console.log(err);
  }
};

const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (err) {
    console.log(err);
    throw new Error(err.code);
  }
};

const sendPasswordResetMail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (err) {
    console.log(err);
  }
};

const reauthenticateUser = async (password) => {
  try {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
  } catch (err) {
    console.log(err);
    return err;
  }
};

const changeUserName = async (newName) => {
  try {
    await updateProfile(auth.currentUser, { displayName: newName });
  } catch (err) {
    console.log(err);
  }
};

const changeProfilePicture = async (imageFile) => {
  try {
    const url = await uploadProfilePhoto(auth.currentUser.uid, imageFile);
    await updateProfile(auth.currentUser, { photoURL: url });
    return url;
  } catch (err) {
    console.log(err);
  }
};

const changePassword = async (oldPassword, password) => {
  try {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      oldPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, password);
  } catch (err) {
    console.log(err);
    return err.code;
  }
};

const removeUser = async () => {
  try {
    await deleteUser(auth.currentUser);
  } catch (err) {
    console.log(err);
  }
};

const logout = () => {
  signOut(auth);
};

export {
  createUser,
  signInUser,
  sendPasswordResetMail,
  reauthenticateUser,
  changeUserName,
  changeProfilePicture,
  changePassword,
  removeUser,
  logout,
};
