import {

LayoutDashboard,

Wallet,

NotebookPen,

Target,

BarChart3,

Brain,

Globe,

Settings

} from "lucide-react";

export default function Sidebar(){

return(

<aside className="sidebar">

<div className="logo">

WAFER AI

</div>

<nav>

<a><LayoutDashboard size={20}/> Dashboard</a>

<a><Wallet size={20}/> Portfolio</a>

<a><NotebookPen size={20}/> Trading Journal</a>

<a><Target size={20}/> Goal</a>

<a><BarChart3 size={20}/> Performance</a>

<a><Brain size={20}/> AI Score</a>

<a><Globe size={20}/> Market</a>

<a><Settings size={20}/> Settings</a>

</nav>

</aside>

)

}
