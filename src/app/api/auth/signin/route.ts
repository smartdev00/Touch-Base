import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

import { getUserByEmail } from "@/lib/firebase/firebaseUtils";

export async function POST(req: Request) {
    try {
        const { data } = await req.json();
        console.log("signin", data);
        const user = await getUserByEmail('user', data.email);
        console.log(user)
        if(user) {
            if((user as any)?.email === data.email && (user as any)?.password === data.password) {
                const token = jwt.sign(user, process.env.JWT_PRIVATE_KEY || "", {
                    expiresIn: '1d'
                })
                return NextResponse.json({user, token}, {status: 200});
            } else {
                return NextResponse.json({error: "Invalid email or password"}, {status: 401});
            }
        } else {
            return NextResponse.json({error: 'User Not Found'}, {status: 404})
        }
    } catch (error) {
        console.error("Error whie signin: ", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}