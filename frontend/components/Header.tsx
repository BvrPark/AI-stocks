"use client";

import { useEffect, useState } from "react";

export default function Header() {

    const [time,setTime]=useState("");

    useEffect(()=>{

        const update=()=>{

            const now=new Date();

            setTime(

                now.toLocaleString("ko-KR")

            );

        }

        update();

        const timer=setInterval(update,1000);

        return ()=>clearInterval(timer);

    },[])

    return(

        <header className="header">

            <div>

                <h1>Dashboard</h1>

                <p>{time}</p>

            </div>

            <div className="header-right">

                <button className="loginBtn">

                    로그인

                </button>

            </div>

        </header>

    )

}
