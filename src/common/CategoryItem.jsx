import { Link } from "react-router-dom";
import './style.css'

export default function CategoryItem({category, rootname, onDeleteButtonClick, isShown}) {
    const handleDeleteRequest = (e) => {
        console.log(category)
        onDeleteButtonClick(category.name);
    };
    return <div className="category-item color5-back">
        {isShown === "yes" && <div className="delete-icon" onClick={handleDeleteRequest}>×</div>}
        <Link to={rootname+category.name} className="category-link color4">{category.name}</Link>
        </div>
}