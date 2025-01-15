import { set, ref } from 'firebase/database'
import { db } from './firebaseConfig'

export function setData(
    name: string,
    year: string,
    month: string,
    day: string,
    state: string,
    value: any,
    isStudent: boolean
) {
    // Adjust the path based on whether it's a student or not
    const basePath = isStudent ? '/Students' : '/Parents'
    const path = `${basePath}/${name}/${year}/${month}/${day}/${state}`

    // Now, set the data using the modified path
    set(ref(db, path), value)
}

/*
    students {
        aleg {
            1/06/24 {
                in : 4:30am
                out: 10:31am
                totaldurationfortheday aka duration: 5hrs
            }
        }
    }
*/
