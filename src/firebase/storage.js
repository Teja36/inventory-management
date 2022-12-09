import { storage } from "./firebase";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const uploadProfilePhoto = async (id, image) => {
  const imgRef = ref(storage, `profile-pictures/${id}`);
  try {
    await uploadBytes(imgRef, image);
    const url = await getDownloadURL(imgRef);
    return url;
  } catch (err) {
    console.log(err);
  }
};

const uploadTempProfilePhoto = async (image) => {
  const imgRef = ref(storage, "profile-pictures/temp");
  try {
    await uploadBytes(imgRef, image);
    const url = await getDownloadURL(imgRef);
    return url;
  } catch (err) {
    console.log(err);
  }
};

const getProfilePhotos = async (ids) => {
  try {
    const promises = ids.map((id) =>
      getDownloadURL(ref(storage, `profile-pictures/${id}`))
    );
    const res = await Promise.allSettled(promises);
    return res.map((result) => {
      if (result.status === "fulfilled") return result.value;
      return "";
    });
  } catch (err) {
    console.log(err);
  }
};

const deleteProfilePhoto = async (id) => {
  const imgRef = ref(storage, `profile-pictures/${id}`);
  try {
    await deleteObject(imgRef);
  } catch (err) {
    console.log(err);
  }
};

export {
  uploadProfilePhoto,
  uploadTempProfilePhoto,
  getProfilePhotos,
  deleteProfilePhoto,
};
