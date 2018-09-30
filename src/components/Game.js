import React from "react"
import ReactDOM from "react-dom"
import GameCard from './GameCard'
import randomize from '../utils/randomize'
import { Button, InputNumber, Radio, Card, Modal, Row, Col } from 'antd'
import "./Game.css"

const RadioGroup = Radio.Group
const DEFAULT_CARD_NUM = 18
const DEFAULT_PLAYER_NUM = 1
const BEST_SCORE= 999
const THOUSAND = 1000

class Game extends React.Component {
    constructor(){
        super()
        this.state = {
            time_elapsed: 0,
            best_score: BEST_SCORE,
            num_of_players: DEFAULT_PLAYER_NUM,
            num_of_cards: DEFAULT_CARD_NUM,
            num_of_cards_left: DEFAULT_CARD_NUM,
            score_of_p1: 0, score_of_p2: 0,
            is_p1_playing: true,
            cards: [],
            uncovered_two_cards_idx: [],
            hintIdxPair: [],
        }
        this.timeHandler = null
    }

    componentDidMount(){
        this.randomizeCards()
        const {num_of_players, best_score} = this.state
        const min_history  = num_of_players===1 ? localStorage.getItem("best_score_one_player") : localStorage.getItem("best_score_two_players")
        this.setState({best_score:  min_history !== null ? min_history : best_score  })
    }


    start = ()=>{
        if(this.timeHandler) return
        this.randomizeCards()
        this.timeHandler = setInterval(()=>{
            this.setState({ time_elapsed: this.state.time_elapsed + THOUSAND })
        },THOUSAND)
    }

    randomizeCards = ()=>{
        const {num_of_cards} = this.state
        const double_cards = randomize(num_of_cards, DEFAULT_CARD_NUM)
        this.setState({cards: double_cards.map((val)=>({val:val, hide: true}))})
    }

    reset = ()=>{
        clearTimeout(this.timeHandler)
        this.timeHandler = null
        this.setState({
            time_elapsed: 0, num_of_players: DEFAULT_PLAYER_NUM,
            num_of_cards: DEFAULT_CARD_NUM, num_of_cards_left: DEFAULT_CARD_NUM,
            score_of_p1: 0, score_of_p2: 0, is_p1_playing: true,
            cards: [], uncovered_two_cards_idx: [], hintIdxPair:[]
        })
        this.randomizeCards()
    }

    setCardNum = (val)=>{ this.setState({num_of_cards: val}) }

    setPlayerNum = (val)=>{
        const min_history  = val===1 ? localStorage.getItem("best_score_one_player") : localStorage.getItem("best_score_two_players")
        this.setState({num_of_players: val, best_score: min_history !== null ? min_history : best_score  })
    }


    // uncover card
    uncover = (idx)=>{
        const { cards, uncovered_two_cards_idx, num_of_cards_left, is_p1_playing, num_of_players, score_of_p1, score_of_p2 } = this.state
        if (uncovered_two_cards_idx.length === 0) {
            this.setState({
                cards: [...cards.slice(0, idx), {...cards[idx], hide: false}, ...cards.slice(idx+1)],
                uncovered_two_cards_idx: [...uncovered_two_cards_idx, idx],
            })
        }else if (uncovered_two_cards_idx.length === 1) {
            this.setState({
                cards: [...cards.slice(0, idx), {val:cards[idx].val, hide: false}, ...cards.slice(idx+1)],
                uncovered_two_cards_idx: [...uncovered_two_cards_idx, idx],
            })
            setTimeout(this.check, 500)
        }else{
            return
        }
    }

    // provide assistance
    hint =()=>{
        const {cards} = this.state
        for (let i = 0; i < DEFAULT_CARD_NUM*2; i++){
            if( cards[i].hide === true ){
                for (let j = i+1; j < DEFAULT_CARD_NUM*2; j++){
                    if(cards[j].hide === true && cards[j].val === cards[i].val)
                    this.setState({hintIdxPair: [i, j]})
                }
            }
        }
    }

    // check if the two uncovered cards are with same value
    check = ()=>{
        const {num_of_players, num_of_cards_left, score_of_p1, score_of_p2, is_p1_playing, uncovered_two_cards_idx, cards} = this.state
        const [idx_1, idx_2] = uncovered_two_cards_idx

        // 1. update moves for players
        this.updateScores()

        // 2. if not match: change cards back
        if (cards[idx_1].val !== cards[idx_2].val){
            this.setState({ cards: cards.map(
                (item, index)=>{
                    if(index === idx_1 || index === idx_2 ) return { ...item, hide: true }
                    else return item
                }
            )})
        // 3. if match: update num_of_cards_left, and check if need to Notify if win
        } else {
            this.checkIfWin();
            this.setState({ num_of_cards_left: num_of_cards_left-1, is_p1_playing: num_of_players === 2 ? !is_p1_playing : true })
        }
    }

    // helper-1 for check(): update scores of players
    updateScores = ()=>{
        const {num_of_players, is_p1_playing, score_of_p1, score_of_p2 } = this.state
        if (num_of_players === 2){
            this.setState(is_p1_playing ? {score_of_p1: score_of_p1+1} : {score_of_p2: score_of_p2+1} )
        }else{
            this.setState({ score_of_p1: score_of_p1+1 })
        }
        this.setState({uncovered_two_cards_idx: []})
    }

    // heler-2 for check(): check if already win
    checkIfWin = ()=>{
        const {num_of_cards_left, num_of_players, is_p1_playing, score_of_p1, score_of_p2, time_elapsed } = this.state
        if (num_of_cards_left===1){
            clearTimeout(this.timeHandler)
            let min_history, min, notificationTitle, notificationBody
            if (num_of_players === 2){
                min_history = localStorage.getItem("best_score_two_players")
                min = score_of_p1< score_of_p2 ? score_of_p1 : score_of_p2
                if ( min_history === null || ( min_history !== null && min < Number(min_history) )) {
                    localStorage.setItem("best_score_two_players", min)
                    this.setState({ best_score: min })
                }
                notificationTitle = min===score_of_p1 ? 'Player 1 win!' : 'Player 2 win!'
            }else{
                min_history = localStorage.getItem("best_score_one_player")
                min = score_of_p1
                if ( min_history === null || ( min_history !== null && min < Number(min_history) )) {
                    localStorage.setItem("best_score_one_player", min)
                    this.setState({ best_score:  min })
                }
                notificationTitle =  'You win!'
            }

            notificationBody = <div><div>Time: {`${time_elapsed/THOUSAND} ses`}</div><div>Score: {min}</div></div>
            Modal.success({ title: notificationTitle, content: notificationBody })

        }
    }


    render(){
        const { time_elapsed, num_of_players, num_of_cards, num_of_cards_left,
            score_of_p1, score_of_p2, is_p1_playing, cards, uncovered_two_cards_idx, best_score, hintIdxPair
        } = this.state

        // 1. gameBoard
        const gameBoard = (
            <div className="gameBoard">
                { cards.map((item,index)=>(
                    <GameCard key={index} idx={index} val={item.val}
                              hide={item.hide} uncover={this.uncover} hint={hintIdxPair}
                    />))
                }
            </div>
        )

        // 2. gameOptions
        const gameOptions = (
            <Card title="Game Options" extra={<a onClick={this.hint}>Hint</a>}>
                <div>
                    <RadioGroup value={num_of_players} disabled={time_elapsed>0} onChange={(e)=>{this.setPlayerNum(e.target.value)}}>
                        <Radio value={1}>One Player</Radio>  <Radio value={2}>Two Players</Radio>
                    </RadioGroup>
                </div>
                <div>Card Num: <InputNumber disabled={time_elapsed>0} min={1} max={num_of_cards} value={num_of_cards} onChange={(val)=>{this.setCardNum(val)}} /></div><br />
                <Button type="primary" onClick={this.start} block disabled={time_elapsed>0} >Start</Button><br />    <br />
                <Button type="primary" onClick={this.reset} block>Reset</Button>
            </Card>
        )


        // 3. statisticInfo
        const statisticInfo=(
            <Card title="Statistic Information">
                <div className="timeElapsed"><b>Time Elapsed :</b> <span className="timeNum">{time_elapsed/THOUSAND}</span> sec </div>
                <div className="highstScore"><b>Highest Score: </b>{best_score}</div>
            </Card>
        )

        // 4. players
        const cardHeadStyle = {backgroundColor: "#fff1b8"}
        const player1 = <Card title="Player 1" headStyle={is_p1_playing ? cardHeadStyle : null}> Moves: {score_of_p1}</Card>
        const player2 = <Card title="Player 2" headStyle={is_p1_playing ? null : cardHeadStyle}> Moves: {score_of_p2}</Card>
        const twoPlayers = ( <Row gutter={5}> <Col span={12}>{player1}</Col> <Col span={12}>{player2}</Col> </Row> )
        const players = num_of_players===1 ? player1: twoPlayers


        return (
            <div className="gridContainer">
                <div className="left"> {gameBoard} </div>
                <div className="right">
                    {gameOptions}   <br />
                    {statisticInfo} <br />
                    {players}       <br />
                </div>
            </div>
        )
    }
}

export default Game
