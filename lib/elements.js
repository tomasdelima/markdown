import React from 'react'
import YouTube from 'react-youtube'
import s from 'react-quick-styles'

export default class Elements extends React.Component {
  constructor(props) {
    super(props)
    this.seed = Math.random()
    this.state = {}
  }

  componentWillMount() {
    this.videos = []
  }

  renderByClassName () {
    var {fragment, renderString, compileFragment, i} = this.props
    var className = fragment.constructor.name

    switch (className) {
      case 'String':
        return <span key={i} className="string" style={[].merge()}>{fragment}</span>
      case 'Array':
        return <span key={i} className="array" style={[s.high()].merge()}>{fragment.map((item, i) => compileFragment(item, i))}</span>
      default:
        return null
    }
  }

  renderByRuleName () {
    var {fragment, renderString, compileFragment, i} = this.props

    switch (fragment.rule) {
      case 'literal':
      case 'escape-char':
        return <span key={i} className={fragment.rule}>{fragment.content}</span>
      case 'columns':
        return <div key={i} className="columns" style={[s.flex, s.wrap].merge()}>{fragment.content.map((item, i) => compileFragment(item, i))}</div>
      case 'column':
        return <div key={i} className="column" style={[s.wide(100*fragment.content[1]/12 + "%"), s.minWidth(fragment.content[1] * 30), s.shrink(0)].merge()}>
          <div style={s.padding(5)}>
            {renderString(fragment.content[2])}
          </div>
        </div>
      case 'page':
        var args = ['']
        var c = fragment.content
        for (var i =0; i < c.length; i++) {
          args[args.length-1] += c[i] == ':' ? c[i-1] == '\\' ? ':' : '' : c[i]
          if (c[i] == ':') {
            if (c[i-1] != '\\') {
              args.push('')
            } else {
              args[args.length-1] = args[args.length-1].slice(0, -2) + args[args.length-1].slice(-1)
            }
          }
        }
        return <Page slug={args[0]} args={args} embedded />
      case 'argument':
        var args = this.props.args || [...Array(Number(fragment.content)+1||0)].map((v,i) => "Argument #"+i)
        return <span key={i} className="argument">{args[fragment.content]}</span>
      case 'image':
        var style = fragment.content[2] ? [s.maxWidth(), s.padding(10), {float: fragment.content[2]}] : [s.wide()]
        return <a href={fragment.content[5]}><img key={i} className="image" style={style.merge()} src={fragment.content[3]}/></a>
      case 'youtube':
        if (!this.state[fragment.content]) this.state[fragment.content] = {width: "100%", height: "0"}
        this.videos[fragment.content+this.seed] = this.videos[fragment.content+this.seed] || <YouTube ref={fragment.content} id={fragment.content} videoId={fragment.content} opts={this.state[fragment.content]} onReady={() => this.updateVideoDimensions(fragment.content+this.seed)}/>
        return this.videos[fragment.content]
      case 'left':
      case 'center':
      case 'right':
      case 'justify':
        return <div key={i} className="alignment" style={{textAlign: fragment.rule}}>{renderString(fragment.content[2])}</div>
      case 'heading':
        return React.createElement("h" + fragment.content[1].length, {key: i, className: 'heading', style: [s.padding(10)].merge()}, fragment.content[2])
      case 'url':
        var url = fragment.content
        return <a key={i} className="url" style={[s.wrapWord].merge()} href={url[3]}>{url[2] || url[3]}</a>
      case 'color':
        return <div key={i} className="color" style={{color: fragment.content[1]}}>{renderString(fragment.content[2])}</div>
      case 'bg':
        return <div key={i} className="bg" style={[s.rect(), {backgroundColor: fragment.content[1]}].merge()}>{renderString(fragment.content[2])}</div>
      case 'new-line':
        return <br key={i} />
      default:
        null
    }
  }

  updateVideoDimensions (videoId) {
    var obj = {}
    var e = $('#'+videoId)
    obj[videoId] = {width: e.width(), height: e.width() * 315/560}
    if (this.state[videoId] != obj) {
      this.videos[videoId] = null
      this.setState(obj)
    }
  }

  renderObject () {
    var {fragment, renderString, compileFragment, i} = this.props
    var className = fragment.constructor.name

    if (className == 'Object') {
      return <span key={i} className={fragment.rule} style={s[fragment.rule]}>{compileFragment(fragment.content)}</span>
    } else {
      console.error('ERROR!!!: UNKNOWN FRAGMENT: ' + JSON.stringify(fragment))
      return null
    }
  }

  render () {
    if (this.props.fragment.match && this.props.fragment.match(/^\s*$/)) {
      return null
    } else {
      return this.renderByClassName() || this.renderByRuleName() || this.renderObject()
    }
  }
}