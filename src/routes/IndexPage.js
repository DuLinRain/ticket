import React, { PureComponent } from 'react';
import { connect } from 'dva';
import styles from './IndexPage.less';
import { Form, Row, Col, Input, Button, Icon, InputNumber } from 'antd';
const BEI = 4;
const LINE_WIDTH = 10;

let candidateIndex = [];
function initArray (len = 0) {
    return new Array(len).fill(0).map((item, i) => {
        return i
    });
}


// for (let i = 0; i< TOTAL_LEN; i++) {
//     let [a, b] = getPositionFromIndex(i + 1, FIRST_ROW_LEN, STEP)
//     console.log([b, a]);
// }

/**
 * 随机产生 [min-max]之间的整数，还需检查一下参数合法性
 * 
 **/
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

/**
 * 随机产生N个 [min-max]之间的整数
 * 
 **/
function getNRandomIntInclusive(min, max, n, cb = () => {}) {
    let result = []
    while (result.length < n) {
        let index = getRandomIntInclusive(min, max)
        if (result.indexOf(index) === -1) {
            result.push(index);
            cb && cb(index);
        } 
    }
    return result
}
function getNRandomRealIndexInclusive(min, max, n, cb = () => {}) {
    let result = []
    while (result.length < n) {
        let index = getRandomIntInclusive(min, max)
        if (result.indexOf(index) === -1) {
            max = max - 1;
            if (candidateIndex[index] === void 0) {
                alert(1);
            }
            result.push(candidateIndex[index]);
            cb && cb(index);
        } 
    }
    return result
}
function getPositionFromIndex (nIndex = 0, basiclen, step, mod = 0) {
    if (nIndex <= 0) {
        return [0, 0];
    }
    if (basiclen <= 0) {
        return [0, 0];
    }
    mod = mod + 1;
    let left = nIndex - basiclen;
    basiclen = basiclen + step
    if (left <= 0) {
        return [nIndex - 1, mod - 1];
    } else if (left > basiclen) {
        return getPositionFromIndex(left, basiclen, step, mod);
    } else {
        return [left - 1, mod];
    }
}

class IndexPage extends PureComponent {
  constructor (props) {
    super(props);
    this._h1 = React.createRef();
    const MAX_ROW = 10;// 26
    const STEP = 2 * BEI;
    const FIRST_ROW_LEN = 50 * BEI;
    const LAST_ROW_LEN = FIRST_ROW_LEN + (MAX_ROW - 1) * STEP;
    const TOTAL_LEN = (FIRST_ROW_LEN + LAST_ROW_LEN) * MAX_ROW / 2;
    const TOTAL_ANGLE = 120;
    const CANDIATE_EACH_ROUND = 5;
    const DRAW_STEP = 5;
    const RADIUS = 200;//半径
    const CANVAS_SIZE = 2 * (RADIUS + MAX_ROW * (LINE_WIDTH + DRAW_STEP));
    candidateIndex = initArray(TOTAL_LEN);
    this.state = {
        MAX_ROW: MAX_ROW,
        LAST_ROW_LEN: FIRST_ROW_LEN + (MAX_ROW - 1) * STEP,
        MAX_Y: MAX_ROW - 1,
        TOTAL_LEN: (FIRST_ROW_LEN + LAST_ROW_LEN) * MAX_ROW / 2,
        FIRST_ROW_LEN: 50 * BEI,
        STEP: 2 * BEI,
        TOTAL_ANGLE: TOTAL_ANGLE,
        CANDIATE_EACH_ROUND,
        DRAW_STEP,
        RADIUS,
        CANVAS_SIZE,
        pageX: 20,
        pageY: 20
    }
  }
  componentDidMount = () => {
    let c = document.getElementById('myCanvas');
    this.canvasIns = c.getContext("2d");
    this.initCanvas()
  }
  getTheta = (y) => {
    let {FIRST_ROW_LEN, STEP, TOTAL_ANGLE} = this.state
    let total = FIRST_ROW_LEN + STEP * y;
    console.log('total', TOTAL_ANGLE)
    return Math.PI * TOTAL_ANGLE / 180 / total
  }
  drawArc = (ctx, radius, start, end, color = '#FFC0CB') => {
    let {CANVAS_SIZE, TOTAL_ANGLE} = this.state
    let CENTER_Y = TOTAL_ANGLE <= 180 ? 0 : CANVAS_SIZE / 2
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_WIDTH;
    ctx.arc(CANVAS_SIZE / 2, CENTER_Y, radius, start, end);
    ctx.stroke();
    ctx.closePath();
  }
  getColor = (x, y) => {
    let {FIRST_ROW_LEN, STEP} = this.state
    let max = FIRST_ROW_LEN + y * STEP;
    let stop = Math.floor(max / 4);
    let a_stop = stop;
    let b_stop = stop * 2;
    let c_stop = stop * 3;
    let d_stop = stop * 4;
    if (x >= 0 && x < a_stop) {
        return '#FFC0CB'
    } else if (x >= a_stop && x < b_stop) {
        return '#87CEFA'
    } else if (x >= b_stop && x < c_stop) {
        return '#FF4500'
    } else {
        return '#FFD700'
    }
  }
  getIndexFromPosition = (x = 0, y = 0) => {
    let {FIRST_ROW_LEN, STEP} = this.state
    if (y === 0) {
        return x;
    }
    return (FIRST_ROW_LEN + FIRST_ROW_LEN + STEP * (y - 1)) * y / 2 + x;
  }
  round = () => {
    let {FIRST_ROW_LEN, STEP, CANDIATE_EACH_ROUND} = this.state
    let candidates = [];
    let positions = [];
    if (candidateIndex.length <= 0) {
        return {
            positions,
            candidates
        } 
    }
    console.log('candidateIndex', candidateIndex)
    if (candidateIndex.length < CANDIATE_EACH_ROUND) {
        alert(`剩余座位不足${CANDIATE_EACH_ROUND}, 将出票${candidateIndex.length}张`);
        candidates =  candidateIndex;
        candidateIndex = []
    } else {
        candidates = getNRandomRealIndexInclusive(0, candidateIndex.length -1, CANDIATE_EACH_ROUND, (index) => {
            candidateIndex.splice(index, 1);
        });
    }
    positions = candidates.map((item) => {
        return getPositionFromIndex(item + 1, FIRST_ROW_LEN, STEP)
    });
    console.log('candidates', candidates);
    console.log('positions', positions);
    return {
        positions,
        candidates
    }
  }
  handleReset = () => {
      this.props.form.resetFields();
      this.handleFormChangeReComputer();
  }
  initCanvas = () => {
    this.clearCanvas()
    let {MAX_ROW, FIRST_ROW_LEN, STEP, DRAW_STEP, RADIUS} = this.state
    for (let j = 0; j < MAX_ROW; j++) {
        let theta = this.getTheta(j);
        let radius = RADIUS + j * (DRAW_STEP + LINE_WIDTH)
        for (let i= 0; i < FIRST_ROW_LEN + STEP * j; i ++) { 
            this.drawArc(this.canvasIns, radius, i * theta, (i + 1) * theta, this.getColor(i, j))
        }
    }
  }
  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
    });
  };
  clearCanvas = () => {
    let {CANVAS_SIZE} = this.state
    this.canvasIns.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE)
  }
  handleChoose = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      if (err) {
        return
      }
      let {count, angle} = values
      this.setState({
        CANDIATE_EACH_ROUND: count
      }, () => {
        console.log('count', count)
        let {DRAW_STEP, RADIUS} = this.state
        let {positions = [], candidates = []} = this.round();
        if (positions.length === 0) {
            alert(`已无票`);
        }
        console.log('positions', positions)
        for (let [x, y] of positions) {
            let theta = this.getTheta(y);
            console.log('theta', theta)
            let radius = RADIUS + y * (DRAW_STEP + LINE_WIDTH)
            this.drawArc(this.canvasIns, radius, x * theta, (x + 1) * theta, '#000')
        }
      })
        
        
    });
    
  }
  handleFormChangeReComputer = (e) => {
    this.props.form.validateFields((err, values) => {
        console.log('Received values of form: ', values);
        if (err) {
            return
        }
        let {max_row, each_row_len, step, angle, draw_step, radius} = values
        console.log(max_row, each_row_len, step)
        let MAX_ROW = max_row;
        let STEP = step * BEI;
        let FIRST_ROW_LEN = each_row_len * BEI;
        let LAST_ROW_LEN = FIRST_ROW_LEN + (MAX_ROW - 1) * STEP;
        let MAX_Y = MAX_ROW - 1;
        let TOTAL_LEN = (FIRST_ROW_LEN + LAST_ROW_LEN) * MAX_ROW / 2;
        let TOTAL_ANGLE = angle;
        let DRAW_STEP = draw_step;
        let RADIUS = radius
        let CANVAS_SIZE = 2* (RADIUS + MAX_ROW * (LINE_WIDTH + DRAW_STEP));
        candidateIndex = initArray(TOTAL_LEN);
        this.setState({
            MAX_ROW,
            FIRST_ROW_LEN,
            LAST_ROW_LEN,
            MAX_Y,
            TOTAL_LEN,
            STEP,
            TOTAL_ANGLE,
            DRAW_STEP,
            RADIUS,
            CANVAS_SIZE,
        }, () => {
            this.initCanvas();
        })
    }); 
  }
  handleDragEnd = (e) => {
    console.log(e.pageX)
    let pageX = Math.abs(e.pageX - 40);
    let pageY = Math.abs(e.pageY - 20);
    this.setState({
        pageX,
        pageY
    })
  }
  render () {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.normal}>
        
        <canvas id="myCanvas" width={this.state.CANVAS_SIZE} height={this.state.CANVAS_SIZE}></canvas>
        <div style={{
            'left': this.state.pageX,
            'top': this.state.pageY
        }} className="formWrapper" draggable="true" onDrop={this.handleDrop}  onDragEnd={this.handleDragEnd}>
            <Form draggable="false" className="ant-advanced-search-form">
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item label="抽取票数">
                            {getFieldDecorator('count', { 
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入抽取票数[1-5]!',
                                    },
                                ],
                                initialValue: 5
                            })(<InputNumber min={1} max={5} />)}
                            <span className="ant-form-text"> 张</span>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='座位角度'>
                            {getFieldDecorator('angle', { 
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入座位整体弧度[60-360]!',
                                    },
                                ],
                                initialValue: 120
                            })(<InputNumber onBlur={this.handleFormChangeReComputer} min={60} max={360} />)}
                            <span className="ant-form-text"> 度</span>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='一共几排？'>
                            {getFieldDecorator('max_row', { 
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入一共几排!',
                                    },
                                ],
                                initialValue: 10
                            })(<InputNumber onBlur={this.handleFormChangeReComputer} min={1} max={100} />)}
                            <span className="ant-form-text"> 排</span>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='每区每排座位数'>
                            {getFieldDecorator('each_row_len', { 
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入每区每排座位数!',
                                    },
                                ],
                                initialValue: 50
                            })(<InputNumber onBlur={this.handleFormChangeReComputer} min={5} max={100} />)}
                            <span className="ant-form-text"> 个</span>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='隔排增加座位数'>
                            {getFieldDecorator('step', { 
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入隔排增加座位数!',
                                    },
                                ],
                                initialValue: 2
                            })(<InputNumber onBlur={this.handleFormChangeReComputer} min={2} max={20} />)}
                            <span className="ant-form-text"> 个</span>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='排间间距'>
                            {getFieldDecorator('draw_step', { 
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入排间间距!',
                                    },
                                ],
                                initialValue: 5
                            })(<InputNumber onBlur={this.handleFormChangeReComputer} min={5} max={20} />)}
                            <span className="ant-form-text"> 像素</span>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='首排距中心距离(半径)'>
                            {getFieldDecorator('radius', { 
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入首排距中心距离(半径)!',
                                    },
                                ],
                                initialValue: 200
                            })(<InputNumber onBlur={this.handleFormChangeReComputer} min={200} max={800} />)}
                            <span className="ant-form-text"> 像素</span>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={this.handleChoose}>
                    抽取
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                    重置
                    </Button>
                </Col>
                </Row>
            </Form>
        </div>
      </div>
    );
  }
}
IndexPage.propTypes = {
};
const WrappedIndexPage = Form.create({ name: 'advanced_search' })(IndexPage);
export default connect()(WrappedIndexPage);
