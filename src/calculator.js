import React from 'react';
import './calculator.css'

export default class Calculator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentVal: "0",
            prevVal: "0",
            formula: "",
            evaluated: false
        };

        this.maxLimitWarning = this.maxLimitWarning.bind(this);
        this.isLimitReached = this.isLimitReached.bind(this);
        this.handleClick = this.handleClick.bind(this);        
        this.handleClear = this.handleClear.bind(this);
        this.handleDel = this.handleDel.bind(this);        
        this.handleNumber = this.handleNumber.bind(this);
        this.handleDecimal = this.handleDecimal.bind(this);
        this.handleOperator = this.handleOperator.bind(this);
        this.handleEqual = this.handleEqual.bind(this);
    }

    get maxLimit() {
        return 21;
    }

    get isOperator() {
        return /[x÷+‑/]/;
    }
     
    get endsWithOperator() {
        return /[-+x÷/]$/
    }

    get endsWithNegativeSign() {
        return /[x÷/+]-$/
    }

    maxLimitWarning() {
        this.setState(state => ({ currentVal: "MAX LIMIT REACHED", prevVal: state.currentVal }));
        setTimeout(() => this.setState(state => ({ currentVal: state.prevVal })), 1000);
    }

    isLimitReached() {
        return this.state.currentVal.includes("LIMIT");
    }

    handleClick(e) {
        switch(e) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":                                    
            case "8":
            case "9":
                this.handleNumber(e)
                break;
            case "x":
            case "÷":
            case "+":                                    
            case "-":
                this.handleOperator(e);
                break;                
            case ".":
                this.handleDecimal();
                break;
            case "=":
                this.handleEqual();
                break;
            case "AC":
                this.handleClear();
                break;
            case "D":
                this.handleDel();
                break;
            default:        
                alert(`Invalid KeyPad value '${e}'.`);                            
        }
    }

    handleClear() {
        this.setState(() => ({ currentVal: "0", prevVal: "0", formula: "", evaluated: false }));
    }

    handleDel() {

        let { currentVal, prevVal, formula, evaluated } = this.state;

        if (!this.endsWithOperator.test(formula)) {

            if (!evaluated) {
                currentVal = currentVal.slice(0, -1);
                formula = currentVal;

                if (currentVal.length === 0) {
                    currentVal = "0"
                }

                prevVal = currentVal;
            }
            else {
                formula = currentVal;
                evaluated = false;
            }

            this.setState(() => ({ currentVal, formula, prevVal, evaluated }));
        }
    }

    handleNumber(value) {
        
        if (!this.isLimitReached()) {

            let { currentVal, formula, evaluated } = this.state;

            if (evaluated) {
                this.setState(() => ({ evaluated: false }));
            }

            if (currentVal.length > this.maxLimit) {
                this.maxLimitWarning();
            } 
            else {

                if (evaluated) {
                    currentVal = value;
                    formula = value !== "0" ? value : "";
                }
                else {
                    currentVal = currentVal === "0" || this.isOperator.test(currentVal)
                        ? value
                        : currentVal + value;
    
                    formula = currentVal === "0" && value === "0"
                        ? formula === "" ? value : formula
                        : /([^.0-9]0|^0)$/.test(formula)
                            ? formula.slice(0, -1) + value
                            : formula + value;
                }
    
                this.setState(() => ({ currentVal, formula }));
            }
        }
    }

    handleOperator(value) {

        if (!this.isLimitReached()) {

            let { prevVal, formula, evaluated } = this.state;
            this.setState({ currentVal: value, evaluated: false });

            if (evaluated) {
                this.setState(() => ({ formula: prevVal + value }));
            } 
            else if (!this.endsWithOperator.test(formula)) {
                this.setState(() => ({ prevVal: formula, formula: formula + value }));
            } 
            else if (!this.endsWithNegativeSign.test(formula)) {
                this.setState(() => ({ formula: (this.endsWithNegativeSign.test(formula + value) ? formula : prevVal) + value }));
            } 
            else if (value !== "‑") {
                this.setState(() => ({ formula: prevVal + value }));
            }
        }
    }

    handleDecimal() {

        const { currentVal, formula, evaluated } = this.state;

        if (evaluated) {
            this.setState(() => ({ currentVal: "0.", formula: "0.", evaluated: false }));
        } 
        else if (!currentVal.includes(".") && !currentVal.includes("LIMIT")) {

            if (currentVal.length > this.maxLimit) {
                this.maxLimitWarning();
            } 
            else if (this.endsWithOperator.test(formula) || (currentVal === "0" && formula === "")) {
                this.setState(state => ({ currentVal: "0.", formula: state.formula + "0." }));
            } 
            else {
                this.setState(state => ({ currentVal: state.formula.match(/(-?\d+\.?\d*)$/)[0] + ".", formula: state.formula + "." }));
            }
        }
    }

    handleEqual() {

        if (!this.isLimitReached()) {

            const { formula, evaluated } = this.state;

            if (!evaluated) {

                let expression = formula; 

                while (this.endsWithOperator.test(expression)) {
                    expression = expression.slice(0, -1);
                }
    
                expression = expression.replace(/x/g, "*").replace(/÷/g, "/");
                const answer = (Math.round(1000000000000 * eval(expression)) / 1000000000000).toString();
    
                this.setState(() => ({ currentVal: answer, formula: formula + "=" + answer, prevVal: answer, evaluated: true }));
            }
        }
    }

    /*** Uncomment 'componentDidMount' to run freeCodeCamp test script ***/
        
    componentDidMount () {
        const script = document.createElement("script");
        script.src = "https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js";
        script.async = true;
        document.body.appendChild(script);
    }

    render() {
        return (
            <div className="container">
                <Output formula={this.state.formula} display={this.state.currentVal} />
                <KeyPad click={this.handleClick} />
            </div>
        )
    }
}

const Output = (props) => {
    return (
        <div className="output">
            <div id="formula">{props.formula}</div>
            <div id="display">{props.display}</div>
        </div>
    )
}

const KeyPad = (props) => {

    const keypads = [
        { id: "clear", value: "AC", cssclass: "keypad keypad-danger", label: "AC" },
        { id: "del", value: "D", cssclass:"keypad keypad-danger", label: "DEL"},
        { id: "divide", value: "÷", cssclass:"keypad keypad-operators", label: "÷"},
        { id: "seven", value: "7", cssclass:"keypad", label: "7"},
        { id: "eight", value: "8", cssclass:"keypad", label: "8"},
        { id: "nine", value: "9", cssclass:"keypad", label: "9"},
        { id: "multiply", value: "x", cssclass:"keypad keypad-operators", label: "×"},
        { id: "four", value: "4", cssclass:"keypad", label: "4"},
        { id: "five", value: "5", cssclass:"keypad", label: "5"},
        { id: "six", value: "6", cssclass:"keypad", label: "6"},
        { id: "subtract", value: "-", cssclass:"keypad keypad-operators", label: "—"},
        { id: "one", value: "1", cssclass:"keypad", label: "1"},
        { id: "two", value: "2", cssclass:"keypad", label: "2"},
        { id: "three", value: "3", cssclass:"keypad", label: "3"},
        { id: "add", value: "+", cssclass:"keypad keypad-operators", label: "+"},
        { id: "zero", value: "0", cssclass:"keypad", label: "0"},
        { id: "decimal", value: ".", cssclass:"keypad", label: "."},
        { id: "equals", value: "=", cssclass:"keypad", label: "="}
    ];

    return (
        <div className="keypads">
            { keypads.map(key => <div id={key.id} value={key.value} className={key.cssclass} onClick={() => props.click(key.value)}>{key.label}</div>) }
        </div>
    )
}