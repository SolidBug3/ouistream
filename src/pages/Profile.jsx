import "./css/Profile.css"

import { useEffect, useState } from "react"

import Avatar from "../components/Avatar/Avatar"
import Card from "../components/Card/Card"
import Content from "../components/Content/Content"

import useAuth from "../supabase/auth/useAuth"
import getUser from "../supabase/db/queries/getUser"
import getRoles from "../supabase/db/queries/getRoles"
import setUser from "../supabase/db/queries/setUser"

import image1 from "../assets/images/theater_thumbnail_1.png"
import image2 from "../assets/images/theater_thumbnail_2.png"
import image3 from "../assets/images/theater_thumbnail_3.png"
import image4 from "../assets/images/theater_thumbnail_4.png"
import image5 from "../assets/images/theater_thumbnail_5.png"
import image6 from "../assets/images/theater_thumbnail_6.png"
import image7 from "../assets/images/theater_thumbnail_7.png"
import image8 from "../assets/images/theater_thumbnail_8.png"

function Profile() {
    const user = useAuth()

    const [name, setName] = useState("")
    const [roleId, setRoleId] = useState("")
    const [quote, setQuote] = useState("")
    const [roles, setRoles] = useState([])

    useEffect(() => {
        if (!user) return

        getUser(user.id).then(data => {
            setName(data.display_name ?? "")
            setRoleId(data.role_id ?? "")
            setQuote(data.quote ?? "")
        })

        getRoles().then(data => {
            setRoles(data)
        })
    }, [user])

    async function save() {
        try {
            await setUser(user.id, name, roleId, quote)
        }
        catch (error) {
            console.error(error)
        }
    }

    return (<div className="ProfileContent">
        <div className="Profile">
            <Avatar />

            <div className="ProfileInfo">
                <input className="ProfileName" value={name} onChange={e => setName(e.target.value)} />

                <select className="ProfileCategory" value={roleId} onChange={e => setRoleId(e.target.value)}>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>

                <textarea className="ProfileQuote" value={quote} onChange={e => setQuote(e.target.value)} />

                <button className="ProfileSave" onClick={save}>Sauvegarder</button>
            </div>
        </div>

        <div className="ProfileBar"></div>

        <Content title="Mes pièces" icon="▶">
            <Card title="La Grande Aventure" produced="Jean Dupont" ecritPar={["Camille Moreau", "Antoine Lefèvre"]} actors={["Jean Dupont", "Marie Martin", "Lucas Bernard"]} image={image1} duration="2:15:08" />
            <Card title="Au-delà de l'Horizon" produced="Sophie Laurent" ecritPar={["Isabelle Mercier"]} actors={["Emma Durand", "Thomas Moreau"]} image={image2} duration="58:42" />
            <Card title="Une Nuit à Paris" produced="Michel Robert" ecritPar={["Julien Faure", "Manon Petit"]} actors={["Lucas Martin", "Sophie Laurent", "Alice Moreau"]} image={image3} duration="1:27:16" />
            <Card title="Le Dernier Été" produced="Claire Dubois" ecritPar={["Charlotte Garnier"]} actors={["Thomas Green", "Olivia Carter"]} image={image4} duration="1:51:03" />
            <Card title="Les Échos de Demain" produced="David Bernard" ecritPar={["Émilie Laurent", "Thomas Girard"]} actors={["James Taylor", "Mia Roberts", "Noah White"]} image={image5} duration="1:42:35" />
            <Card title="Le Royaume Oublié" produced="Robert Johnson" ecritPar={["Alexandre Rousseau", "Claire Fontaine"]} actors={["Henry Davis", "Charlotte Moore", "Leo Clark"]} image={image6} duration="2:03:47" />
            <Card title="Sous le Même Ciel" produced="Anna Mitchell" ecritPar={["Margot Chevalier"]} actors={["William Hall", "Emily Young"]} image={image7} duration="1:16:29" />
            <Card title="Là où nous appartenons" produced="James Walker" ecritPar={["Nathan Brooks", "Alice Turner"]} actors={["Lily Evans", "Oscar King", "Amelia Scott"]} image={image8} duration="1:38:54" />
        </Content>

        <Content title="Mes courts métrages" icon="▶">
            <Card title="Dernier Regard" produced="Thomas Bernard" ecritPar={["Julien Moreau"]} actors={["Alice Martin", "Lucas Dupont"]} image={image1} duration="12:34" />
            <Card title="Le Silence" produced="Claire Laurent" ecritPar={["Sophie Robert"]} actors={["Emma Martin", "Hugo Bernard"]} image={image2} duration="8:47" />
            <Card title="Après la Pluie" produced="Michel Dubois" ecritPar={["Antoine Girard", "Marie Petit"]} actors={["Lucas Moreau", "Élise Martin"]} image={image3} duration="17:21" />
            <Card title="Une Dernière Danse" produced="Sophie Garnier" ecritPar={["Camille Rousseau"]} actors={["Thomas Laurent", "Julie Bernard"]} image={image4} duration="14:52" />
            <Card title="L'Étranger" produced="David Moreau" ecritPar={["Nathan Petit"]} actors={["Oscar Martin", "Chloé Laurent"]} image={image5} duration="21:08" />
            <Card title="Le Passage" produced="Anna Robert" ecritPar={["Alexandre Dubois", "Claire Moreau"]} actors={["Louis Bernard", "Émilie Petit"]} image={image6} duration="10:16" />
            <Card title="Minuit" produced="James Laurent" ecritPar={["Margot Martin"]} actors={["William Robert", "Léa Dubois"]} image={image7} duration="6:42" />
            <Card title="Sans Retour" produced="Robert Martin" ecritPar={["Alice Laurent", "Thomas Petit"]} actors={["Noah Bernard", "Amélie Moreau"]} image={image8} duration="19:35" />
        </Content>
    </div>)
}

export default Profile