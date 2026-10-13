export type Animal = "elephant" | "tiger" | "hen" | "cat";
export type Profile = {name:string;line:string;intro:string;strength:string;watch:string;learn:string;phrase:string;week:string[]};
export type Report = {version:string;animal:Animal;secondary:Animal|null;blend:boolean;created:number;profile:Profile;secondaryName:string|null;dimensions:{warmth:string;boundary:string};insights:{title:string;choice:string;analysis:string}[];note:string};
