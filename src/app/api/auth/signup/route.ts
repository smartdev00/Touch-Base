import { getRecordByFilter } from "@/lib/airtable/airtable";
import { addUser, getUserByEmail } from "@/lib/firebase/firebaseUtils";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
    const { data } = await req.json();
    console.log("data: ", data);
    try {
        const payedUser = await getRecordByFilter('TouchBase With', 'Email', data.email);
        console.log('payedUser: ', payedUser);
        if (payedUser) {
            const existingUser = await getUserByEmail('user', data.email);
            console.log('existinguser: ', existingUser);
            if (existingUser) {
                if((existingUser as any)?.password === data.password){
                    const token = jwt.sign({user: existingUser}, process.env.JWT_PRIVATE_KEY || "", {
                        expiresIn: '1d'
                    })
                    return NextResponse.json({token, user: {...existingUser}}, {status: 200});
                } else {
                    return NextResponse.json({error: "Found you! But the password is incorrect."}, {status: 401})
                }
            } else {
                const user = await addUser('user', data);
                if (!user) {
                    console.log('Failed to sign up. Try again!');
                    return NextResponse.json({error: "Internal server error"}, {status: 500});
                }
                const token = jwt.sign({user}, process.env.JWT_PRIVATE_KEY || "", {
                    expiresIn: '1d'
                })
                return NextResponse.json({token, user: {...user}}, {status: 200})
            }
        } else {
            return NextResponse.json({
                error: "I'm sorry - we didn't find someone with this email address with access. Please email - hello@systemssavedme.com if there seems to be a mistake"
            }, {status: 404})
        }
    } catch (error) {
        console.error("Error while signup: ", error);
        return NextResponse.json({error: "Invalid server error."});
    }
}