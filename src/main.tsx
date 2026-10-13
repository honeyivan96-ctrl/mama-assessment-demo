import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import MamaApp from "./components/mama-app";
import AdminPanel from "./components/admin-panel";
import {isDemo} from "./lib/api";
import "./styles.css";
function App(){
 const [hash,setHash]=useState(location.hash);
 useEffect(()=>{const update=()=>setHash(location.hash);window.addEventListener("hashchange",update);return()=>window.removeEventListener("hashchange",update);},[]);
 const params=new URLSearchParams(hash.slice(1));
 if(hash==="#admin"&&!isDemo)return <AdminPanel/>;
 return <MamaApp key={hash} initialId={params.get("result")||undefined}/>;
}
createRoot(document.getElementById("root")!).render(<App/>);
