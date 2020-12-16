const url  = "http://localhost:3000/api";

class Errors extends React.Component {
    render() {
        return (
            <div>
                <strong>{this.props.message}!</strong>
            </div>
        )
    }
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            errors:null,
            userID:'',
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    fetchData(data) {
        var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        fetch(url+'/login', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': cookieValue
            },
            body: data
        })
            .then( response => {
                if (!response.ok) {
                    throw response.statusText
                }
                return response.json()  //we only get here if there is no error
            })
            .then( json => {
                console.log('Success:', JSON.stringify(json));
                this.setState({userID: json.userID});
                this.props.setLoggedIn(this.state.userID);
                this.props.showUserPanel();
            })
            .catch( err => {
                console.log(err);
                this.setState({errors: err})
            })
    }

    handleChange = event =>{
        this.setState({ [event.target.name]:event.target.value })
    };

    handleSubmit = (e) => {
        this.setState({errors: null});
        e.preventDefault();
        var data = { email:this.state.email, password:this.state.password };
        data=JSON.stringify(data);
        console.log("FETCH_DATA: "+data);
        this.fetchData(data);
    };

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="form login-form">
                    <h3>Login to Hell</h3>
                    <p>Email: <input type="email" name="email" placeholder="email" onChange={this.handleChange}/></p>
                    <p>Password: <input type="password" name="password" placeholder="password" onChange={this.handleChange}/></p>
                    <div className="buttons">
                        <input type="submit" value="Submit" className="button signup" />
                    </div>
                    {this.state.errors ? <Errors message={this.state.errors}/> : null}
                </div>
            </form>
        )
    }
}

class UserPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: null,
            name: '',
            email: '',
            fakeCreditCard: null,
            time: null,
            showMainPanel:true,
            showModifyPanel:false,
            showAdminPanel:false,
            username: '',
            password:'',
            role:null,
            dir:'',
            jwtCookieToken:'',
            csrfCookieToken:''
        };
        this.extendMembership = this.extendMembership.bind(this);
        this.showModifyPanel = this.showModifyPanel.bind(this);
        this.showAdminPanel = this.showAdminPanel.bind(this);
        this.showMainPanel = this.showMainPanel.bind(this);
        this.unregister = this.unregister.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentWillMount(){
        var jwtCookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)JWT-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        var csrfCookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        console.log('jwtCookieValue: ', jwtCookieValue);
        console.log('csrfCookieValue: ', csrfCookieValue);
        this.setState({jwtCookieToken: jwtCookieValue});
        this.setState({csrfCookieToken: csrfCookieValue});
    }

    componentDidMount(){
        console.log('this.state.jwtCookieToken: ', this.state.jwtCookieToken);
        console.log('this.state.csrfCookieToken: ', this.state.csrfCookieToken);
        var id=this.props.userID;

        fetch(url+'/users/'+id, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Authorization': this.state.jwtCookieToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.state.csrfCookieToken,
            }
        }) .then( response => {
            if (!response.ok) {
                throw response.statusText
            }
            return response.json()
        })
            .then( json => {
                console.log('Success:', JSON.stringify(json));
                this.setState({time: json.membership_valid});
                this.setState({role: json.role});
                this.setState({name: json.name});
                this.setState({username: json.name});
                this.setState({email: json.email});
                this.setState({fakeCreditCard: json.fakeCreditCard});
            })
            .catch( err => {
                console.log(err);
                this.setState({errors: err})
            })
    }

    extendMembership(e) {
        e.preventDefault();
        var id=this.props.userID;

        fetch(url+'/users/'+id+'/membership', {
            credentials: 'include',
            method: 'PATCH',
            headers: {
                'Authorization': this.state.jwtCookieToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.state.csrfCookieToken,
            }
        }) .then( response => {
            if (!response.ok) {
                throw response.statusText
            }
            return response.json()
        })
            .then( json => {
                console.log('Success:', JSON.stringify(json));
                this.setState({time: json.membership_valid});
            })
            .catch( err => {
                console.log(err);
                this.setState({errors: err})
            })


        /*
        var xhr = new XMLHttpRequest();
        xhr.open("PATCH", url +'/users/'+id+'/membership', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('CSRF-Token', cookieValue);
        xhr.onload = function () {
            var result = JSON.parse(xhr.responseText);
            if (xhr.readyState == 4 && xhr.status == "200") {
                console.log(result);
            } else {
                console.log(result);
            }
        };
        xhr.onerror = function() {
            return alert(`Network Error`);
        };
        xhr.send(null);
        */
    }

    showAdminPanel() {
        this.setState({showMainPanel:false, showAdminPanel:true});
    }

    showModifyPanel() {
        this.setState({showMainPanel:false, showModifyPanel:true});
    }

    showMainPanel() {
        this.setState({showMainPanel:true, showModifyPanel:false, showAdminPanel:false});
    }

    unregister(){
        var id=this.props.userID;

        fetch(url+'/users/'+id, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Authorization': this.state.jwtCookieToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.state.csrfCookieToken,
            }
        }).then( response => {
            if (!response.ok) {
                throw response.statusText
            }
            return response.json()
        }).then( json => {
            console.log('Success:', JSON.stringify(json));
            alert(json.message);
            this.props.handleLogoutClick(this.state.userID);
        }).catch( err => {
            console.log(err);
            this.setState({errors: err})
        })
    }

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value})
    };

    onSubmit(dir, e){
        console.log(event);
        e.preventDefault();
        var id=this.props.userID;
        var data = {
            email: this.state.email,
            password: this.state.password,
            name: this.state.name,
            fakeCreditCard: this.state.fakeCreditCard
        };
        data=JSON.stringify(data);

        var xhr = new XMLHttpRequest();
        var response='';
        xhr.open('PUT', url+ '/users/' +id+ '/' +dir, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('CSRF-Token', this.state.csrfCookieToken);
        xhr.setRequestHeader('Authorization', this.state.jwtCookieToken);
        xhr.onload = function () {
            if (xhr.readyState == 4 && xhr.status == "200") {
                response = JSON.parse(xhr.responseText);
                console.log("response: " + response);
                if(response.name) this.setState({name: response.name});
                if(response.name) this.setState({username: response.name});
                if(response.email) this.setState({email: response.email});
                if(response.fakeCreditCard) this.setState({fakeCreditCard: response.fakeCreditCard});
                this.setState({errors: response.message});
            } else {
                response = JSON.parse(xhr.responseText);
                console.log("response: " + response);
                this.setState({errors: response.message});
                alert(response.message);
            }
        }.bind(this);
        xhr.onerror = function () {
            return alert(`Network Error`);
        };
        xhr.send((data));

        /*
        fetch(url+ '/users/' +id+ '/' +dir, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': cookieValue
            },
            body: data
        }).then( response => {
            if (!response.ok) {
                throw response.statusText
            }
            return response.json()
        }).then( json => {
            console.log('Success:', JSON.stringify(json));
            this.setState({name: json.name});
            this.setState({username: json.name});
            this.setState({email: json.email});
            this.setState({fcc: json.fcc});
            alert(json.message);
        }).catch( err => {
            console.log(err);
            this.setState({errors: err})
        })*/
    };

    render() {
        return (
            <form>
                <div className="form login-form">
                    {this.state.errors ? <Errors message={this.state.errors}/> : null}
                    <p>Logged in as <strong>{this.state.username}</strong></p>
                    {this.state.showMainPanel ? (
                        <div>
                            <p>Membership valid until: {this.state.time}</p>
                            <div className="buttons">
                                <button className="button" onClick={this.extendMembership}>Extend your Membership by 30 days</button>
                            </div>
                            <div className="buttons">
                                <button className="button" onClick={this.showModifyPanel}>Modify your user data</button>
                            </div>
                            <div className="buttons">
                                <button className="button" onClick={this.showAdminPanel}>Admin</button>
                            </div>
                        </div>
                    ) : null}
                    {this.state.showModifyPanel ? (
                        <div>
                            <form onSubmit={(e) => this.onSubmit('name', e)}>
                                <div className="form">
                                    <b>Change your Username</b>
                                    <input type="text" name="name" placeholder={this.state.name} onChange={this.handleChange}/>
                                    <div className="buttons">
                                        <input type="submit" value="Submit" className="button"/>
                                    </div>
                                </div>
                            </form>
                            <form onSubmit={(e) => this.onSubmit('email', e)}>
                                <div className="form">
                                    <b>Change your Email</b>
                                    <input type="email" name="email" placeholder={this.state.email} onChange={this.handleChange}/>
                                    <div className="buttons">
                                        <input type="submit" value="Submit" className="button"/>
                                    </div>
                                </div>
                            </form>
                            <form onSubmit={(e) => this.onSubmit('fcc', e)}>
                                <div className="form">
                                    <b>Change your Fake Credit Card Number</b>
                                    <input type="text" name="fakeCreditCard" placeholder={this.state.fakeCreditCard} onChange={this.handleChange}/>
                                    <div className="buttons">
                                        <input type="submit" value="Submit" className="button"/>
                                    </div>
                                </div>
                            </form>
                            <form onSubmit={(e) => this.onSubmit('password', e)}>
                                <div className="form">
                                    <b>Change your Password</b>
                                    <input type="text" name="password" onChange={this.handleChange} />
                                    <div className="buttons">
                                        <input type="submit" value="Submit" className="button"/>
                                    </div>
                                </div>
                            </form>
                            <div className="buttons">
                                <button className="button" onClick={this.Unregister}>Unregister</button>
                            </div>
                            <div className="buttons">
                                <button className="button" onClick={this.showMainPanel}>Go Back</button>
                            </div>
                        </div>
                    ) : null}
                    {this.state.showAdminPanel ? (
                        <div>
                            <AdminPanel role={this.state.role} />
                            <div className="buttons">
                                <button className="button" onClick={this.showMainPanel}>Go Back</button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </form>
        )
    }
}

class AdminPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: null,
            userIsAdmin:false,
            users:[],
            jwtCookieToken:'',
            csrfCookieToken:''
        };
        this.handlePromoteClick = this.handlePromoteClick.bind(this);
    }
    componentWillMount(){
        var jwtCookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)JWT-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        var csrfCookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        console.log('jwtCookieValue: ', jwtCookieValue);
        console.log('csrfCookieValue: ', csrfCookieValue);
        this.setState({jwtCookieToken: jwtCookieValue});
        this.setState({csrfCookieToken: csrfCookieValue});
    }

    componentDidMount() {
        console.log('this.state.jwtCookieToken: ', this.state.jwtCookieToken);
        console.log('this.state.csrfCookieToken: ', this.state.csrfCookieToken);
        console.log('this.props.role: ', this.props.role);
        var userRole = this.props.role;
        if (userRole===2) this.setState({userIsAdmin: true});

        fetch(url+'/admin/users', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': this.state.jwtCookieToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.state.csrfCookieToken,
            }
        })
            .then(response => {
                return response.json();
            })
            .then(user => {
                this.setState({ users: user });
                console.log("USERS: ", this.state.users)
            })
            .catch(error => console.log(error))
    }
    /*
        componentDidUpdate() {
            fetch(url+'/admin/users', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': this.state.jwtCookieToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'CSRF-Token': this.state.csrfCookieToken,
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(user => {
                    this.setState({ users: user });
                    console.log("USERS: ", this.state.users)
                })
                .catch(error => console.log(error))
        }
    */
    handlePromoteClick(id,e){
        e.preventDefault();
        console.log("USER ID: ", id);
        var data = {
            role: 2
        };
        data=JSON.stringify(data);

        fetch(url+'/admin/users/'+id +'/role', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Authorization': this.state.jwtCookieToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.state.csrfCookieToken,
            },
            body:data
        })
            .then(response => {
                return response.json();
            })
            .then(user => {
                this.reloadUsers();
                console.log("USERS: ", this.state.users)
            })
            .catch(error => console.log(error))
    }

    handleDemoteClick(id,e){
        e.preventDefault();
        console.log("USER ID: ", id);

        var data = {
            role: 1
        };
        data=JSON.stringify(data);

        fetch(url+'/admin/users/'+id +'/role', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Authorization': this.state.jwtCookieToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.state.csrfCookieToken,
            },
            body:data
        })
            .then(response => {
                return response.json();
            })
            .then(user => {
                this.reloadUsers();
                console.log("USERS: ", this.state.users)
            })
            .catch(error => console.log(error))
    }

    reloadUsers(){
        fetch(url+'/admin/users', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': this.state.jwtCookieToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.state.csrfCookieToken,
            }
        })
            .then(response => {
                return response.json();
            })
            .then(user => {
                this.setState({ users: user });
                console.log("USERS: ", this.state.users)
            })
            .catch(error => console.log(error))
    }

    handleDeleteClick(id,e){
        e.preventDefault();
        console.log("USER ID: ", id);

        fetch(url+'/admin/users/'+id, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Authorization': this.state.jwtCookieToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.state.csrfCookieToken,
            }
        })
            .then(response => {
                return response.json();
            })
            .then(user => {
                this.reloadUsers();
                console.log("USERS: ", this.state.users)
            })
            .catch(error => console.log(error))

        /*
        var xhr = new XMLHttpRequest();
        xhr.open("DELETE", url +'/admin/users/'+ id, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('CSRF-Token', this.state.csrfCookieToken);
        xhr.setRequestHeader('Authorization', this.state.jwtCookieToken);
        xhr.onload = function () {
            var response = JSON.parse(xhr.responseText);
            if (xhr.readyState == 4 && xhr.status == "200") {
                console.log(response);
            } else {
                console.log(xhr.responseText);
            }
        };
        xhr.onerror = function() {
            return alert(`Network Error`);
        };
        xhr.send(null);*/
    }

    render() {
        const users = this.state.users;
        const listItems = users.map((users) =>
            <tr key={users.id}>
                <td>{users.name}</td>
                <td>{users.email}</td>
                <td>{users.role}</td>
                <td>{users.membership_valid}</td>
                <td>
                    <button onClick={(e) => this.handlePromoteClick(users.id, e)}>Promote</button>
                    <button onClick={(e) => this.handleDemoteClick(users.id, e)}>Demote</button>
                    <button onClick={(e) => this.handleDeleteClick(users.id, e)}>Delete</button>
                </td>
            </tr>
        );
        return (
            <div>
                {this.state.errors ? <Errors message={this.state.errors}/> : null}
                {this.state.userIsAdmin ? (
                    <div>
                        <h2>Welcome Admin!</h2>
                        <strong>List of all users:</strong>
                        <table>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Membership Expires</th>
                                <th>Edit</th>
                            </tr>
                            {listItems}
                        </table>
                    </div>
                ) : (
                    <div>
                        <h3>FOR ADMINS ONLY!</h3>
                    </div>
                )}
            </div>
        )
    }
}

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: null,
            name: '',
            email: '',
            password: '',
            fcc: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="form">
                    <h3>Sign in</h3>
                    <input type="text" name="email" placeholder="email" onChange={this.handleChange}/>
                    <input type="password" name="password" placeholder="password" onChange={this.handleChange}/>
                    <input type="text" name="name" placeholder="username" onChange={this.handleChange}/>
                    <input type="number" name="fcc" placeholder="fake Credit Card" onChange={this.handleChange}/>
                    <input type="submit" value="Register"/>
                    {this.state.errors ? <Errors message={this.state.errors}/> : null}
                </div>
            </form>
        )
    }

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value})
    };

    handleSubmit = (event) => {
        var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        this.setState({errors: null});
        event.preventDefault();
        var data = {
            email: this.state.email,
            password: this.state.password,
            name: this.state.name,
            fakeCreditCard: this.state.fcc
        };
        data = JSON.stringify(data);
        console.log("FETCH_DATA: " + data);

        var xhr = new XMLHttpRequest();
        var response='';
        xhr.open('POST', url+'/users', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('CSRF-Token', cookieValue);
        xhr.onload = function () {
            if (xhr.readyState == 4 && xhr.status == "200") {
                data = JSON.parse(xhr.responseText);
                response=data.message;
                console.log("response: " + response);
                this.setState({errors: response});
            } else {
                data = JSON.parse(xhr.responseText);
                response=data.message;
                console.log("response: " + response);
                this.setState({errors: response});
            }
        }.bind(this);
        xhr.onerror = function () {
            return alert(`Network Error`);
        };
        xhr.send((data));
    };
}

class Information extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: null,
        };
    }
    componentDidMount(){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                this.setState({message: xhr.responseText});
            }
            else{
                this.setState({message: xhr.responseText});
            }
        }.bind(this);
        xhr.open("GET", "https://baconipsum.com/api/?type=meat-and-filler&paras=5&format=text", true);
        xhr.send();
    }
    render() {
        return (
            <div>
                {this.state.message}
            </div>
        )
    }
}

const initialState= {
    username: null,
    isLoggedIn: false,
    userID:'',
    showUser:false,
    register: false,
    information: false,
    login: false,
    errors:false
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);
        this.handleRegisterClick = this.handleRegisterClick.bind(this);
        this.handleInfoClick = this.handleInfoClick.bind(this);
        this.setLoggedIn = this.setLoggedIn.bind(this);
        this.showUserPanel = this.showUserPanel.bind(this);
        this.state = initialState;
    }

    componentDidMount() {
        fetch(url, {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.text())
            .then((res) => {
                console.log('Cookie received!');
            }).catch((err) => {
            console.log(err);
        });
    }


    handleLogoutClick() {
        this.setState(initialState);
    }

    handleLoginClick() {
        this.setState({login: true, register: false, information: false});
    }

    handleRegisterClick() {
        this.setState({login:false, register: true, information: false});
    }

    handleInfoClick() {
        this.setState({login:false, information: true, register: false});
    }

    setLoggedIn(userID) {
        this.setState({isLoggedIn:true, userID: userID});
    }

    showUserPanel() {
        this.setState({login:false, information: false, register: false, showUser: true});
    }

    render() {
        const isLoggedIn = this.state.isLoggedIn;
        return (
            <div>
                {isLoggedIn ? (
                    <div>
                        <h1>Welcome to Hell!</h1>
                        <UserPanel userID={this.state.userID} handleLogoutClick={this.handleLogoutClick} />
                        <button class="button" onClick={this.handleLogoutClick}>Logout</button>
                    </div>
                ) : (
                    <div>
                        <h1>Welcome to Hell</h1>
                        <h3>You are NOT logged in!</h3>
                        <button class="button" onClick={this.handleLoginClick}>Login</button>
                        <button class="button" onClick={this.handleRegisterClick}>Register</button>
                        <button class="button" onClick={this.handleInfoClick}>Info</button>
                        {this.state.login ? <LoginForm setLoggedIn={this.setLoggedIn} showUserPanel={this.showUserPanel}/> : null}
                        {this.state.register ? <RegisterForm /> : null}
                        {this.state.information ? <Information /> : null}
                    </div>
                )}
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("root"));