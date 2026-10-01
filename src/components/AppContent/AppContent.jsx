import "./AppContent.css"

import Card from "../Card/Card"
import Content from "../Content/Content"

import image1 from "../../assets/images/theater_thumbnail_1.png"
import image2 from "../../assets/images/theater_thumbnail_2.png"
import image3 from "../../assets/images/theater_thumbnail_3.png"
import image4 from "../../assets/images/theater_thumbnail_4.png"
import image5 from "../../assets/images/theater_thumbnail_5.png"
import image6 from "../../assets/images/theater_thumbnail_6.png"
import image7 from "../../assets/images/theater_thumbnail_7.png"
import image8 from "../../assets/images/theater_thumbnail_8.png"

function AppContent() {
    return (<div className = "AppContent">
        <Content title="À voir" icon="▶">
            <Card title="Les Échos de Demain" produced="David Bernard" actors={["James Taylor", "Mia Roberts", "Noah White"]} image={image5} duration="1:42:35" />
            <Card title="La Grande Aventure" produced="Jean Dupont" actors={["Jean Dupont", "Marie Martin", "Lucas Bernard"]} image={image1} duration="2:15:08" />
            <Card title="Au-delà de l'Horizon" produced="Sophie Laurent" actors={["Emma Durand", "Thomas Moreau"]} image={image2} duration="58:42" />
        </Content>

        <Content title="Toutes les pièces" icon="🎭">
            <Card title="La Grande Aventure" produced="Jean Dupont" actors={["Jean Dupont", "Marie Martin", "Lucas Bernard"]} image={image1} duration="2:15:08" />
            <Card title="Au-delà de l'Horizon" produced="Sophie Laurent" actors={["Emma Durand", "Thomas Moreau"]} image={image2} duration="58:42" />
            <Card title="Une Nuit à Paris" produced="Michel Robert" actors={["Lucas Martin", "Sophie Laurent", "Alice Moreau"]} image={image3} duration="1:27:16" />
            <Card title="Le Dernier Été" produced="Claire Dubois" actors={["Thomas Green", "Olivia Carter"]} image={image4} duration="1:51:03" />
            <Card title="Les Échos de Demain" produced="David Bernard" actors={["James Taylor", "Mia Roberts", "Noah White"]} image={image5} duration="1:42:35" />
            <Card title="Le Royaume Oublié" produced="Robert Johnson" actors={["Henry Davis", "Charlotte Moore", "Leo Clark"]} image={image6} duration="2:03:47" />
            <Card title="Sous le Même Ciel" produced="Anna Mitchell" actors={["William Hall", "Emily Young"]} image={image7} duration="1:16:29" />
            <Card title="Là où nous appartenons" produced="James Walker" actors={["Lily Evans", "Oscar King", "Amelia Scott"]} image={image8} duration="1:38:54" />
        </Content>
        </div>)
}

export default AppContent;