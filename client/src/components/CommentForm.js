import Preact from 'preact'
import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom'
import store from '../store'

import {formToObj} from '../utils'
import Comment from './Comment'


const Loading = () => <span>Loading...</span>

const status = {
	IDLE: 0,
	WAIT: 1,
}

class CommentForm extends Preact.Component{

	constructor(props){
		super(props)
		this.setState( {status: status.IDLE} )
		this.onSubmit = this.onSubmit.bind(this)
	}

	onSubmit(ev){
		const {storyId, commentId} = this.props

		ev.preventDefault()
		this.setState( {status: status.WAIT} )
		const form = formToObj(new FormData(ev.target))
		const body = Object.assign(form, {
			storyId,
			commentId,
		})

		fetch('/api/create-comment', {
			method: 'post',
			credentials: 'include',
			headers: {'content-type': 'application/json', 'X-CSRF-Prevention': 1},
			body: JSON.stringify(body),
		})
			.then( x => x.json() )
			.then( x => {
				this.setState( {status: status.IDLE} )
			})
			.then( () => window.location = window.location )
			.catch( e => console.error(e) )

	}

	render(){
		const {storyId} = this.props.storyId
		return (
			<form class='reply-story-form' onSubmit={this.onSubmit}>
				<textarea name='content' />
				<div>
					<button disabled={this.state.status === status.WAIT} >save</button>
					{ this.state.status === status.WAIT && <Loading /> }
				</div>
			</form>
		)
	}
}

export default CommentForm
