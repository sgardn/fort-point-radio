# Fort Point Radio

Spinning all the freshie traxxx since '014. Get jamming already:

`git clone https://github.com/sgardn/fort-point-radio`

### Client
###### Just play me some tasty jams plz
- Install [tampermonkey] for the chrome web browser
- Add tampermonkey.js as a user script to the plugin - make sure that the `@match` field aligns with your company's Hipchat web client address
- Enable the script

The script will now queue whatever the most recent youtube video is inside each room and play it inside an iframe. It will pull new videos from a queue when one finishes, meaning you don't ever have to press play.

### Serving content
###### What's that? You want to DJ too?

- [Enable scrobbling] to last.fm for your spotify account (or what have you)
- Fill in the appropriate room number, Hipchat API key, and [last.fm] scrobbling feed in `vars.js`
- `npm install` this repo
- `node scrape.js`
- Listen to music using spotify

Node will now scrape your most recently played songs off [last.fm], search [youtube] for them, grab the most popular search result for the song you just played, and post it to the hipchat room specified in `vars.js`. Anyone using the client will have your posted messages queued to their current stream of youtube videos.

[last.fm]:http://www.last.fm
[youtube]:http://www.youtube.com
[enable scrobbling]:http://www.last.fm/help/faq?category=99
[tampermonkey]:https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en