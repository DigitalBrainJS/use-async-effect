import React from "react";
import TestComponent from "./TestComponent";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {url: props.url, _url: props.url};
        this.onClick = this.onClick.bind(this);
        this.onFetchClick = this.onFetchClick.bind(this);
        this.handleChange= this.handleChange.bind(this);
    }

    onFetchClick(){
        console.log(`fetch click`);
        this.setState(({_url})=> this.setState({url: _url}))
    }

    onClick() {
        console.log(`click`);
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
                <TestComponent url={this.state.url}></TestComponent>
                <button onClick={this.onClick}>Remount</button>
            </div>
        );
    }
}
