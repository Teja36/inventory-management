import { db } from "./firebase";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteProfilePhoto } from "./storage";

const itemCollection = collection(db, "items");

const itemStatsRef = doc(db, "items", "--stats--");

const userStatsRef = doc(db, "users", "--stats--");

const addItem = async (values, locations) => {
  values = Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (key === "qty") return [key, value];
      return [key, value.toLowerCase().trim()];
    })
  );
  try {
    const { id } = await addDoc(itemCollection, {
      ...values,
      createdAt: Timestamp.now(),
    });
    updateDoc(itemStatsRef, {
      count: increment(1),
      [`chart.${values.potency}`]: increment(1),
    });
    addNewLocationForItem(id, locations);
    return id;
  } catch (err) {
    console.log(err);
  }
};

const addSelectItem = async (collectionName, item) => {
  try {
    await addDoc(collection(db, collectionName), {
      name: item,
    });
  } catch (err) {
    console.log(err);
  }
};

const getSelectItems = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const res = querySnapshot.docs.map((doc) => doc.data().name);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const getItems = async () => {
  try {
    const q = query(itemCollection, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    const res = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    return res;
  } catch (err) {
    console.log(err);
  }
};

const getSortedItems = async (sortStatus, startsWith, filter) => {
  const queryConstraints = [];
  let end;
  try {
    if (startsWith) {
      filter = filter[0].toLowerCase() + filter.substring(1);

      if (filter === "quantity") {
        filter = "qty";
        startsWith = parseInt(startsWith);
        queryConstraints.push(where(filter, "==", startsWith));
      } else {
        startsWith = startsWith[0].toLowerCase() + startsWith.substring(1);

        end = startsWith.replace(/.$/, (c) =>
          String.fromCharCode(c.charCodeAt(0) + 1)
        );

        queryConstraints.push(
          where(filter, ">=", startsWith),
          where(filter, "<", end)
        );
        if (sortStatus.columnAccessor !== filter)
          queryConstraints.push(orderBy(filter));
      }
    }
    const querySnapshot = await getDocs(
      query(
        itemCollection,
        ...queryConstraints,
        orderBy(sortStatus.columnAccessor, sortStatus.direction)
      )
    );
    const res = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    if (startsWith && startsWith !== "" && res.length)
      await updateDoc(doc(db, "searches", "search-count"), {
        count: increment(1),
      });

    return res;
  } catch (err) {
    console.log(err);
  }
};

const updateItem = async (id, oldPotency, values) => {
  values = Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (key === "qty") return [key, value];
      return [key, value.toLowerCase().trim()];
    })
  );

  try {
    await updateDoc(doc(db, "items", id), values);

    if (values.potency !== oldPotency)
      updateDoc(itemStatsRef, {
        [`chart.${values.potency}`]: increment(1),
        [`chart.${oldPotency}`]: increment(-1),
      });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const deleteItem = async (id, potency) => {
  try {
    await deleteDoc(doc(db, "items", id));
    updateDoc(itemStatsRef, {
      [`chart.${potency}`]: increment(-1),
      count: increment(-1),
    });
  } catch (err) {
    throw new Error("Oops");
  }
};

const setUserDetails = async (
  id,
  email,
  name,
  phone,
  role = "user",
  status = "active"
) => {
  try {
    await setDoc(doc(db, "users", id), {
      name,
      email,
      phone,
      role,
      status,
      createdAt: Timestamp.now(),
    });
    updateDoc(userStatsRef, { count: increment(1) });
  } catch (err) {
    console.log(err);
  }
};

const getUsers = async (startsWith) => {
  let q = query(collection(db, "users"), orderBy("createdAt"));
  try {
    if (startsWith) {
      startsWith = startsWith[0].toUpperCase() + startsWith.substring(1);
      const end = startsWith.replace(/.$/, (c) =>
        String.fromCharCode(c.charCodeAt(0) + 1)
      );
      q = query(
        collection(db, "users"),
        where("name", ">=", startsWith),
        where("name", "<", end)
      );
    }

    const querySnapshot = await getDocs(q);
    const res = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res;
  } catch (err) {
    console.log(err);
  }
};

const getUserInfo = async (userID) => {
  try {
    const docSnap = await getDoc(doc(db, "users", userID));

    if (docSnap.exists()) {
      const { status, role, phone } = docSnap.data();
      return { exists: true, status, role, phone };
    } else {
      return { exists: false };
    }
  } catch (err) {
    console.log(err);
  }
};

const updateUserRole = async (userID, role) => {
  try {
    await updateDoc(doc(db, "users", userID), {
      role,
    });
  } catch (err) {
    console.log(err);
  }
};

const updateUserStatus = async (userIDs, status) => {
  try {
    userIDs.forEach(async (userID) => {
      await updateDoc(doc(db, "users", userID), {
        status: status.toLowerCase(),
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const updateUserInfo = async (id, name, phone) => {
  try {
    await updateDoc(doc(db, "users", id), {
      name,
      phone,
    });
  } catch (err) {
    console.log(err);
  }
};

const removeUsers = async (userIDs) => {
  try {
    userIDs.forEach(async (userID) => {
      await deleteDoc(doc(db, "users", userID));
      await deleteProfilePhoto(userID);
      updateDoc(userStatsRef, { count: increment(-1) });
    });
  } catch (err) {
    console.log(err);
  }
};

const getRecentlySearchedItems = async (ids) => {
  try {
    const promises = ids.map(async (id) => getDoc(doc(db, "items", id)));

    const res = await Promise.all(promises);

    return res.flatMap((docSnap) => {
      if (docSnap.exists()) return { uid: docSnap.id, ...docSnap.data() };
      return [];
    });
  } catch (err) {
    console.log(err);
  }
};

const getMedicineCount = async () => {
  try {
    const res = await getDoc(itemStatsRef);
    return res.data().count;
  } catch (err) {
    console.log(err);
  }
};

const getUserCount = async () => {
  try {
    const res = await getDoc(userStatsRef);
    return res.data().count;
  } catch (err) {
    console.log(err);
  }
};

const getSearchCount = async () => {
  try {
    const querySnapshot = await getDoc(doc(db, "searches", "search-count"));
    return querySnapshot.data().count;
  } catch (err) {
    console.log(err);
  }
};

const initDataForDonut = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "items"));

    const data = querySnapshot.docs.reduce((obj, doc) => {
      const potency = doc.data().potency;
      if (obj[potency] !== undefined) obj[potency] = obj[potency] + 1;
      else obj[potency] = 1;
      return obj;
    }, {});

    return data;
  } catch (err) {
    console.log(err);
  }
};

const getDataForDonut = async () => {
  try {
    const querySnapshot = await getDoc(itemStatsRef);

    const data = querySnapshot.data().chart;

    return data;
  } catch (err) {
    console.log(err);
  }
};

const addNewLocationForItem = (id, values) => {
  try {
    setDoc(doc(db, "locations", id), {
      ...values,
    });
  } catch (err) {
    console.log(err);
  }
};

const updateLocationOfItem = async (id, values) => {
  try {
    await setDoc(doc(db, "locations", id), {
      ...values,
    });
  } catch (err) {
    console.log(err);
  }
};

const locateItemByID = async (id) => {
  try {
    const res = await getDoc(doc(db, "locations", id));
    return res.data();
  } catch (err) {
    console.log(err);
  }
};

const increamentSearchCount = () => {
  try {
    updateDoc(doc(db, "searches", "search-count"), {
      count: increment(1),
    });
  } catch (err) {
    console.log(err);
  }
};

export {
  addItem,
  addSelectItem,
  getSelectItems,
  getItems,
  getSortedItems,
  updateItem,
  deleteItem,
  setUserDetails,
  getUsers,
  getUserInfo,
  updateUserRole,
  updateUserStatus,
  updateUserInfo,
  removeUsers,
  getRecentlySearchedItems,
  getMedicineCount,
  getUserCount,
  getSearchCount,
  getDataForDonut,
  updateLocationOfItem,
  locateItemByID,
  increamentSearchCount,
};
