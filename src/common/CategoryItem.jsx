import { Link } from "react-router-dom";
import './style.css'

export default function CategoryItem({category, rootname}) {
    return <div className="category-item">
        <Link to={rootname+category.name} className="category-link">{category.name}</Link>
        </div>
}