import { Link } from "react-router-dom";
import './style.css'

export default function CategoryItem({category, rootname}) {
    return <div className="category-item color5-back">
        <Link to={rootname+category.name} className="category-link color4">{category.name}</Link>
        </div>
}