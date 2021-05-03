import React from "react";
import TestComponent1 from "./TestComponent1";
import TestComponent2 from "./TestComponent2";
import TestComponent3 from "./TestComponent3";
import TestComponent4 from "./TestComponent4";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {url: props.url, _url: props.url};
        this.onClick = this.onClick.bind(this);
        this.onFetchClick = this.onFetchClick.bind(this);
        this.handleChange= this.handleChange.bind(this);
    }

    onFetchClick(){
        this.setState(({_url})=> this.setState({url: _url}))
    }

    onClick() {
        this.setState({ timestamp: Date.now() });
    }

    handleChange(event){
        console.log(event.target.value);
        this.setState({_url: event.target.value});
    }

    render() {
        return (
            <div key={this.state.timestamp} id="app">
                <input className="field-url" type="text" value={this.state._url} onChange={this.handleChange} />
                <button className="btn-change" onClick={this.onFetchClick} disabled={this.state.url==this.state._url}>Change URL to Fetch</button>
                <TestComponent1 url={this.state.url}></TestComponent1>
                <TestComponent2 url={this.state.url}></TestComponent2>
                <TestComponent3 url={this.state.url}></TestComponent3>
                <TestComponent4 url={this.state.url}></TestComponent4>
                <div><button onClick={this.onClick}>Remount all components</button></div>
            </div>
        );
    }
}
