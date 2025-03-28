import Airtable from "airtable";
import { FieldSet } from "airtable/lib/field_set";
import { Records } from "airtable/lib/records";

const base = new Airtable({apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || "");

export const getRecords = async (tableName: string) => {
    const records: Records<FieldSet>[] = [];
    await base(tableName)
        .select({maxRecords: 100, view: "All Customers"})
        .eachPage((fetchedRecords, fetchNextPage) => {
            records.push(fetchedRecords);
            fetchNextPage();
        })
    return records;
}

export const getRecordByFilter = async (tableName: string, filterField: string, filter: string) => {
    const records = await base(tableName)
        .select({
            filterByFormula: `${filterField} = '${filter}'`, // Filter filterField by filter value
            maxRecords: 1, // Get only one record
            view: "All Customers"
        })
        .firstPage(); 

    return records.length > 0 ? records[0].fields : null; // Return the first record or null if not found
}

export const createRecord = async (tableName: string, fields: []) => {
    const record = await base(tableName).create(fields);
    return record;
}