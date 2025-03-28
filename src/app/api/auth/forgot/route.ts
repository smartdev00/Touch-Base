import { getUserByEmail, updateDocument } from "@/lib/firebase/firebaseUtils";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'gladwyn.anderson.infor@gmail.com',
        pass: process.env.NODEMAILER_PASSWORD
    }
})

const sendMailer = (mailOptions: any) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err.message);
                reject(err)
            }
            resolve(info)
        })
    })
}

export async function POST(req: Request) {
    try {
        const { data } = await req.json();
        console.log("req in /api/auth/forgot", data);
        const user = await getUserByEmail('user', data?.email)
        if(!user || !user.id) {
            return NextResponse.json({error: "User not found!"}, {status: 404})
        }
        const otp = Math.floor(Math.random() * 10000)
        const mailOptions = {
            from: '',
            to: data?.email,
            subject: '',
            text: otp,
            html: '<b>Hello World</b>'
        }
        console.log("before send mail")
        await sendMailer(mailOptions)
        await updateDocument('user', user.id, {...user, otp: otp})
        console.log("after send mail")
        return NextResponse.json({message: 'Success'})
    } catch (error) {
        console.error("Error in /api/auth/forgot");
        return NextResponse.json({error: 'Internal Server Error.'}, {status: 500})
    }
}