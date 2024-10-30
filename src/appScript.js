// Original code from https://github.com/jamiewilson/form-to-google-sheets
// Updated for 2021 and ES6 standards

const scriptProp = PropertiesService.getScriptProperties()

function initialSetup() {
    const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost(e) {
    const lock = LockService.getScriptLock()
    lock.tryLock(10000)

    try {
        const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
        let rawDataSheetName = 'RawDataStudents'
        // Things needed to sync the cache in "CurrentlySignedInCache"
        const currentDate = new Date()
        const cacheSheet = doc.getSheetByName('CurrentlySignedInCache')
        let columnLetter = 'A'
        let columnIndex = 1
        let nameRange, nameValues, rowIndex

        if (e.parameter.studentOrParent === 'Parent') {
            columnLetter = 'B'
            columnIndex = 2
            rawDataSheetName = 'RawDataParents'
        }

        const rawDataSheet = doc.getSheetByName(rawDataSheetName)

        const headers = rawDataSheet
            .getRange(1, 1, 1, rawDataSheet.getLastColumn())
            .getValues()[0]
        const nextRow = rawDataSheet.getLastRow() + 1

        let newRow = headers.map(function (header) {
            return header === 'Date' ? currentDate : e.parameter[header]
        })

        if (e.parameter.inOrOut === 'Out') {
            nameRange = cacheSheet.getRange('A2:B')
            nameValues = nameRange.getValues()
            // Find the row index of the name in the cache
            rowIndex = nameValues.findIndex(
                (row) =>
                    row[0] === e.parameter.name || row[1] === e.parameter.name
            )
            if (rowIndex !== -1) {
                // Remove the name from the cache
                cacheSheet.getRange(rowIndex + 2, columnIndex).setValue('')

                // Calculate sign-in time
                newRow = newRow.map(function (value, index) {
                    return headers[index] === 'Duration'
                        ? calculateDuration(rawDataSheet, e.parameter.name) /
                              1000
                        : value // Convert duration from milliseconds to seconds
                })
            }
        } else {
            nameRange = cacheSheet.getRange(`${columnLetter}2:${columnLetter}`)
            nameValues = nameRange.getValues()
            rowIndex = nameValues.findIndex((row) => row[0] === '')

            if (rowIndex !== -1) {
                cacheSheet
                    .getRange(rowIndex + 2, columnIndex)
                    .setValue(e.parameter.name)
            }
        }

        rawDataSheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

        return ContentService.createTextOutput(
            JSON.stringify({ result: 'success', row: nextRow })
        ).setMimeType(ContentService.MimeType.JSON)
    } catch (e) {
        return ContentService.createTextOutput(
            JSON.stringify({ result: 'error', error: e })
        ).setMimeType(ContentService.MimeType.JSON)
    } finally {
        lock.releaseLock()
    }
}

function calculateDuration(rawDataSheet, name) {
    // Get the range of 'A2:D${lastRow}' in the raw data sheet
    // Last row is just setting the upper limit via append
    const rawDataValues = rawDataSheet
        .getRange('A2:D' + rawDataSheet.getLastRow())
        .getValues()
    const signOutDayPST = Utilities.formatDate(new Date(), 'PST', 'MM/dd/yyyy')

    const sortByDate = rawDataValues.filter((row) => {
        return (
            Utilities.formatDate(row[2], 'PST', 'MM/dd/yyyy') === signOutDayPST
        )
    })
    const sortByTime = sortByDate
        .slice()
        .sort((a, b) => b[2].getTime() - a[2].getTime())
    const lastSignInIndex = sortByTime.findIndex(
        (row) => row[0] === name && row[1] === 'In'
    )

    const lastSignInTime = sortByTime[lastSignInIndex][2]
    const signInDayPST = Utilities.formatDate(
        new Date(lastSignInTime),
        'PST',
        'MM/dd/yyyy'
    )

    let duration = 0
    if (signInDayPST === signOutDayPST) {
        duration = new Date().getTime() - new Date(lastSignInTime).getTime()
    }
    // Turn seconds into hours
    return duration / 3600.0
}
