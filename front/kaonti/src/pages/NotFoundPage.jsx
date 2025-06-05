import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <article style={{ padding: "100px" }}>
            <h1>Oops!</h1>
            <h2> Error 404: Page Not Found</h2>
            <div className="flexGrow">
                <p>La page que vous chercher n'existe pas.</p>
                <Link to="/">Cliquer ici pour revenir à la page d'authentification</Link>
            </div>
        </article>
    )
}

export default NotFoundPage;