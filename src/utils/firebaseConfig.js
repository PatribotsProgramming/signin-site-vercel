// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { get, set, ref } from 'firebase/database'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API,
    authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const db = getDatabase(app)

export const getData = () => {
    return get(ref(db, '/'))
        .then((snapshot) => {
            if (snapshot.exists()) {
                return snapshot.val()
            }
        })
        .catch((error) => {
            console.error(error)
        })
        .then((data) => {
            return data
        })
}

export const setData = async (
    isStudent = true,
    name,
    year,
    month,
    day,
    index,
    state,
    value
) => {
    // Adjust the path based on whether it's a student or not
    const basePath = isStudent ? '/Students' : '/Parents'

    let path = `${basePath}/${name}/${year}/${month}/${day}`

    if (index != null) {
        path += `/${index}`
    }

    path += `/${state}`

    // Now, set the data using the modified path
    set(ref(db, path), value)
}
