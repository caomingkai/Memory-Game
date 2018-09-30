import React from "react";
import ReactDOM from "react-dom";
import "./GameCard.css"
import { Button, InputNumber, Radio, Card } from 'antd';


const GameCard = (props)=>{
    const {idx, val, hide, uncover, hint} = props
    const clickHandler = ()=>{ uncover(idx) }
    const isHintCard = idx===hint[0] || idx===hint[1]

    const gameCardPlaceholder = hide ? (
        <div className={isHintCard ? "gameCardBackHintStyle" : "gameCardBackStyle" } onClick={clickHandler} ><div className="tableCell">?</div></div>
    ):(
        <div className="gameCardFrontStyle" ><div className="tableCell">{val}</div></div>
    )

    return gameCardPlaceholder
}

export default GameCard
