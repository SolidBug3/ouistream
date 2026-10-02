import "./Home.css"
import "../../components/Content.css"

import { useState } from "react"

import Menu from "../../components/Menu/Menu"
import Search from "../../components/Search/Search"
import Card from "../../components/Card/Card"

import image from "../../assets/images/theater_thumbnail_1.png"

function Home() {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all")

    return (
        <div className="Home">
            <Menu />

            <div className="Content">
                <Search value={search} onChange={setSearch} filter={filter} onFilterChange={setFilter} />

                <section className="Content-section">
                    <h2 className="Content-title">À la une</h2>

                    <div className="Content-grid">
                        <Card title="Le souffle de l'espoir" produced="Antoine Maldeme" actors={["Jean Dupont", "Marie Martin"]} image={image} duration="59:32" ecritPar={["Antoine Maldeme, Agnes Despres"]} />
                        <Card title="Le souffle de l'espoir" produced="Antoine Maldeme" actors={["Jean Dupont", "Marie Martin"]} image={image} duration="59:32" ecritPar={["Antoine Maldeme, Agnes Despres"]} />
                        <Card title="Le souffle de l'espoir" produced="Antoine Maldeme" actors={["Jean Dupont", "Marie Martin"]} image={image} duration="59:32" ecritPar={["Antoine Maldeme, Agnes Despres"]} />
                    </div>
                </section>

                <section className="Content-section">
                    <h2 className="Content-title">Nouvelles pièces</h2>

                    <div className="Content-grid">
                        <Card title="Le souffle de l'espoir" produced="Antoine Maldeme" actors={["Jean Dupont", "Marie Martin"]} image={image} duration="59:32" ecritPar={["Antoine Maldeme, Agnes Despres"]} />
                        <Card title="Le souffle de l'espoir" produced="Antoine Maldeme" actors={["Jean Dupont", "Marie Martin"]} image={image} duration="59:32" ecritPar={["Antoine Maldeme, Agnes Despres"]} />
                        <Card title="Le souffle de l'espoir" produced="Antoine Maldeme" actors={["Jean Dupont", "Marie Martin"]} image={image} duration="59:32" ecritPar={["Antoine Maldeme, Agnes Despres"]} />
                    </div>
                </section>

                <section className="Content-section">
                    <h2 className="Content-title">Toutes les pièces</h2>

                    <div className="Content-grid">
                        <Card title="Le souffle de l'espoir" produced="Antoine Maldeme" actors={["Jean Dupont", "Marie Martin"]} image={image} duration="59:32" ecritPar={["Antoine Maldeme, Agnes Despres"]} />
                        <Card title="Le souffle de l'espoir" produced="Antoine Maldeme" actors={["Jean Dupont", "Marie Martin"]} image={image} duration="59:32" ecritPar={["Antoine Maldeme, Agnes Despres"]} />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Home