import Preact, {Component} from 'preact'
import PropTypes from 'prop-types'
import pageCache from '../pageCache'
import store from '../store'
import Comment from './Comment'
import CommentForm from './CommentForm'
import {EventEmitter} from 'fbemitter'
import SetDocumentTitle from './SetDocumentTitle'
import {EditStoryForm} from './StoryForm'
import {goBack} from '../promisedNavigate'
import StoryItem from './StoryItem'

const onClickDelete = (ev) => {
  const storyId = ev.target.dataset.storyId
  fetch('/api/delete-story', {
    method: 'post',
    credentials: 'include',
    headers: {'content-type': 'application/json', 'X-CSRF-Prevention': 1},
    body: JSON.stringify({
      id: storyId,
    }),
  })
    .then( r => r.json())
    .then( r => {
      if (r.error) throw r.error
    })
    .then( () => window.location = window.location )
    .catch( e => console.error(e))
}


class Score extends Component {

  constructor(props) {
    super(props)
    const {story, score} = props
    this.state.score = score
    this.state.vote = this.initialVote = store.userVotes.get(`story${story}`) || 0
  }

  toggleVote() {
    const {story, score} = this.props
    this.setState({vote: this.state.vote === 0 ? 1 : 0})
    const tempVote = this.state.vote - this.initialVote
    this.setState({score: score + tempVote})

    fetch('/api/vote', {
      method: 'post',
      credentials: 'include',
      headers: {'content-type': 'application/json', 'X-CSRF-Prevention': 1},
      body: JSON.stringify({
        direction: this.state.vote,
        target: story,
        target_type: 'story',
      }),
    })
      .then( r => r.json())
      .then( r => console.log(r))
      .catch( e => console.error(e))
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    this.props.eventEmitter.addListener('toggleVote', this.toggleVote.bind(this))
  }

  render() {
    const cName = this.state.score === 1 ? 'like' : 'unvoted'
    return <span class={ 'score ' + cName }>{this.state.score} </span>
  }
}

Score.propTypes = {
  story: PropTypes.object.isRequired,
  score: PropTypes.number.isRequired,
  eventEmitter: PropTypes.instanceOf(EventEmitter).isRequired,
}


const onClickEdit = function() {
  this.setState({editing: true})
}

class StoryProper extends Component {

  constructor(props) {
    super(props)
    this.onClickDelete = onClickDelete.bind(this)
    this.onClickEdit = onClickEdit.bind(this)
    this.eventEmitter = new EventEmitter()
  }


  render() {
    const {story: s} = this.props
    const editing = this.state.editing
    return (

      <section class='story'>
        <div class='goback'><span onClick={goBack} class='pointer'>&lt;&nbsp;回前頁</span></div>
        <StoryItem story={s} showPlate={true} />
        <div class='actions'>
          <span class='edit' onClick={this.onClickEdit}>編輯</span>
          <span class='delete' onClick={this.onClickDelete} data-story-id={s.id}>刪除</span>
          <span>分享</span>
          <span>檢舉</span>
        </div>

        { editing && <EditStoryForm
          storyId={s.id} title={s.title} content={s.content} tags={s.tags}
          link={s.link}
        />}
        { s.deleted
          ? <div class='content'>[deleted]</div>
          : <div class='content' dangerouslySetInnerHTML={({__html: s.content_marked})} />
        }
      </section>
    )


  }
}

StoryProper.propTypes = {
  story: PropTypes.object.isRequired,
}

const Story = ({story}) => (
  <main class='story-page'>
    <SetDocumentTitle title={story.title}/>
    <StoryProper story={story} />
    <CommentForm storyId={story.id} commentId={null}/>
    <section id='comment-section'>
      {(story.comments||[]).map( c =>
        <Comment storyId={story.id} comment={c}  key={c.id} />
      )}

      {!story.comments &&
        <div>No comments yet.</div>
      }
    </section>
  </main>
)

Story.propTypes = {
  story: PropTypes.object.isRequired,
}

const withStory = (Wrapped) => class extends Preact.Component {
  render() {
    this.endpoint = '/api/story/'+ window.location.pathname.slice(3)
    const {story} = pageCache.get(this.endpoint)
    return <Wrapped story={story} />
  }
}


export default withStory(Story)
