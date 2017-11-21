import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Row, Input, Radio } from 'antd';
import constants from '../../constants/variable.js'
const wordList = constants.MOCK_SOURCE;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Search = Input.Search;


class MockList extends Component {
  static propTypes = {
    click: PropTypes.func,
    clickValue: PropTypes.string

  }

  constructor(props) {
    super(props)
    this.state = {
      filter: '',
      list: []
    }

  }

  componentDidMount() {
    this.setState({
      list: wordList
    })
  }


  onFilter = (e) => {

    const list = wordList.filter(item => {
      return item.mock.indexOf(e.target.value) !== -1
    });
    this.setState({
      filter: e.target.value,
      list: list
    })
  }


  onSearch = (v) => {
    console.log("v", v);
    // this.props.click(v);
  }

  render() {
    const { list, filter } = this.state;
    const { click, clickValue } = this.props;
    return (
      <div className="modal-postman-form-mock">
        <h3 className="mock-title title">mock数据</h3>
        <Search
          onChange={this.onFilter}
          onSearch={this.onSearch}
          value={filter}
          placeholder="搜索mock数据"
          className="mock-search"
        />
        {/* <RadioGroup onChange={click} value={clickValue}> */}
        {
          list.map((item, index) => {
            return <Row
              key={index}
              type="flex"
              align="middle"
              className={'row ' + (item.mock === clickValue ? 'checked' : '')}
              onClick={() => click(item.mock)} >
              <span>{item.mock}</span>
            </Row>
          })
        }
        {/* </RadioGroup> */}
      </div>
    )

  }

}

export default MockList;