const config = require('../config')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Tag = require('../server/models/Tag')
const Story = require('../server/models/Story')
const StoryTag = require('../server/models/StoryTag')

mongoose.connect(config.mongourl, {useMongoClient: true })
.then(() =>  StoryTag.collection.remove({}))
.then(() => Tag.collection.remove({}))
.then(() => Story.collection.find({}).toArray())
.then(docs => Promise.all(docs.map(x => StoryTag.refreshTagsForStory(x.id))))
.then( () => console.log('done') )
.catch(console.error)
.then( () => process.exit() )
