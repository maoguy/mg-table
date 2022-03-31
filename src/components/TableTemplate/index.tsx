import React, { useState, useEffect } from 'react';
import { Table, TableProps, Pagination } from 'bellejs';
import styles from './index.module.css'

function showTotal(total: number) {
  return `共 ${total} 条`
}

interface TTableData { //用于渲染表格的状态
  list:object[] ; //表格数据
  total:number ; //总记录数
  page:number ; //当前页码
  size:number ; //每页最大记录数
}

interface TTableConfig { //用于渲染表格的配置项
  rowKey:React.Key ; //record[rowKey]作为主键
  rowSelectionType?:"checkbox"|"radio" ; //表格行选择框(空:不可选;checkbox:多选;radio:单选)
}

interface TFilterConditionExtends { //泛型约束
  page:number ; //当前页
  size:number ; //每页最大记录数
}

interface TTableState<TFilterCondition> {
  isFetching:boolean ; //是否正在获取
  filterCondition:TFilterCondition ; //过滤条件(当前页码page,每页最大记录数size 等)
  tableData:TTableData ;
  tableConfig:TTableConfig ;
  selectedRowKeys:React.Key[];
}

type TUpdateTableState = (...arg0: any[])=>any ;

type TSetFilterCondition<TFilterCondition> = (filterCondition:TFilterCondition|((filterCondition:TFilterCondition)=>TFilterCondition))=>any ;

type TSetSelectedRowKeys = (selectedRowKeys:React.Key[])=>any ;

export type TTableStateAndActions<TFilterCondition> = [
  TTableState<TFilterCondition>,
  TUpdateTableState ,
  TSetFilterCondition<TFilterCondition> ,
  TSetSelectedRowKeys
] ; //表格状态钩子

interface TProps<TFilterCondition> {
  tableState:TTableState<TFilterCondition> ;
  updateTableState:TUpdateTableState ;
  setFilterCondition:TSetFilterCondition<TFilterCondition> ;
  setSelectedRowKeys:TSetSelectedRowKeys ;
  tableProps?:TableProps<any> ; //Table组件原有的PropsType
  headerNode?:any ;
  footerNode?:any ;
}

interface TState {

}

class TableTemplate<TFilterCondition> extends React.Component<TProps<TFilterCondition>,TState> {
  state={

  }
  
  handleChangeOfPagination = async (currentPage:number , pageSize:number) => { //分页器处理器
    const {
      setFilterCondition ,
    } = this.props ;
    setFilterCondition((filterCondition)=>{
      return {
        ...filterCondition ,
        page:currentPage ,
        size:pageSize
      }
    })
  }
  getRowKey = (record: { [x: string]: string; }):string => {
    //rowKey映射
    const {
      tableState:{
        tableConfig:{rowKey} ,
      },
    } = this.props ;
    return record[rowKey] ;
  }
  get selectedRowKeys () {
    const {
      tableState:{
        selectedRowKeys
      }
    } = this.props ;
    return selectedRowKeys ;
  }
  handleChangeOfTableRowSelect = (selectedRowKeys: React.Key[]) => {
    const {
      setSelectedRowKeys
    } = this.props ;
    setSelectedRowKeys(selectedRowKeys) ;
  }
  onRow = (record: { [x: string]: any; })=>{
    const {
      tableState:{
        tableConfig:{
          rowKey ,
          rowSelectionType
        } ,
        selectedRowKeys=[] ,
      },
      setSelectedRowKeys
    } = this.props ;
    return {
      onClick: (_event: any) => {
        if(selectedRowKeys.includes(record[rowKey] as never)){//如果存在，则取消
          const newSelectedRowKeys = selectedRowKeys.filter(key => key !== record[rowKey]);
          setSelectedRowKeys(rowSelectionType==="radio"?[]:newSelectedRowKeys) ;
        }else{//如果不存在，则选中
          setSelectedRowKeys([...rowSelectionType==="radio"?[]:selectedRowKeys,...[record[rowKey]]]) ;
        }
      }
    }
  }
  render(){
    const {
      tableState:{
        isFetching,
        tableData:{list,total,page,size} ,
        tableConfig:{rowSelectionType} ,
        selectedRowKeys
      },
      tableProps ,
      headerNode ,
      footerNode
    } = this.props ;
    return (
      <div className={styles["page-common-table-box"]}>
        {headerNode}
        <Table
          size="small"
          loading={isFetching}
          pagination={false}
          dataSource={list}
          rowKey={this.getRowKey}
          onRow={this.onRow}
          rowSelection={rowSelectionType&&{
            type: rowSelectionType ,
            onChange:this.handleChangeOfTableRowSelect ,
            selectedRowKeys
          }}
          {...tableProps}
        />
        <Pagination
          className={styles["pagination-right"]}
          size="small"
          showSizeChanger
          showQuickJumper
          showTotal={showTotal}
          current={page}
          pageSize={size}
          total={total}
          onChange={this.handleChangeOfPagination}
        />
        {footerNode}
      </div>
    ) ;
  }
}


/*
封装了有关TableTemplate所需的【状态】和相应【行为】的【自定义hook】
*/
function useTableState<TFilterCondition extends TFilterConditionExtends> (
  initTableState:TTableState<TFilterCondition> ,
  fetchTableData:(filterCondition:TFilterCondition)=>Promise<TTableData|void> , //若返回类型为TTableData,则为正常;若为void则为异常
  options?:{
    filterConditionEffectKeys:string[] //设置了则添加至useEffect中
  } 
):TTableStateAndActions<TFilterCondition> {

  const [tableState,setTableState] = useState(initTableState) ;
  
  useEffect(() => {
    updateTableState() ;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableState.filterCondition.size,
    tableState.filterCondition.page,
    ...(options?.filterConditionEffectKeys||[]).map((key)=>{
      return tableState.filterCondition[key] ;
    })
  ]);

  async function setFilterCondition(
    filterCondition:TFilterCondition|((filterCondition:TFilterCondition)=>TFilterCondition) ,
    shouldForceUpdateTableState?:boolean , //是否强制刷新表格数据
  ) { //更新filterCondition(支持对象式和函数式)
    const nextFilterCondition = typeof filterCondition === 'function'?filterCondition(tableState.filterCondition):filterCondition ;
    await setTableState((tableState)=>{
      return {
        ...tableState ,
        filterCondition:nextFilterCondition
      }
    }) ;
    if(shouldForceUpdateTableState===true){
      console.log("update之前:",tableState.filterCondition) //这段逻辑好像没用
      __updateTableStateByFilterCondition__(nextFilterCondition) ;
    }
  }

  function setSelectedRowKeys(selectedRowKeys:[]) {
    setTableState({
      ...tableState ,
      selectedRowKeys
    }) ;
  }

  function getTablePage(page:number,size:number,total:number):number { //获取表格页码(判断当前页码是否越界)
    const lastPage = Math.ceil(total/size) ; //向上取整获得最后一页的页码 
    if(page!==1&&page>lastPage){ //页码越界判断
      return lastPage ;
    }else{
      return page ;
    }
  }

  async function __updateTableStateByFilterCondition__(filterCondition:TFilterCondition):Promise<any> { //内部方法
    await setTableState((tableState)=>({
      ...tableState ,
      isFetching:true ,
    })) ;
    /**** fetch START */
    try{
      const tableData:TTableData|void = await fetchTableData(filterCondition) ;
      console.log("tableData:",tableData) ;
      if(tableData){
        setTableState({
          ...tableState ,
          filterCondition:{
            ...filterCondition ,
            page:getTablePage(tableData.page,tableData.size,tableData.total) //filterCondition.page与tableData.page保持同步
          },
          tableData ,
          selectedRowKeys:tableState.selectedRowKeys.filter(
            (key)=>tableData.list.map(
              (record)=>record[tableState.tableConfig.rowKey]).includes(
                key
              )), //过滤掉当前表格不存在的selectedRowKeys
          isFetching:false
        }) ;
      }else{ //若返回为空,则按异常处理
        setTableState({
          ...tableState ,
          isFetching:false
        });
      }
    }catch(error){ //异常处理
      console.error(error) ;
      setTableState({
        ...tableState ,
        isFetching:false
      });
    }
    /**** fetch END */
  }

  function updateTableState() { //作为hook调用后返回的提供给外部的方法
    __updateTableStateByFilterCondition__(tableState.filterCondition) ;
    // await setTableState((tableState)=>({
    //   ...tableState ,
    //   isFetching:true ,
    // })) ;
    // /**** fetch START */
    // try{
    //   const tableData:TTableData|void = await fetchTableData(tableState.filterCondition) ;
    //   console.log("tableData:",tableData) ;
    //   if(tableData){
    //     setTableState({
    //       ...tableState ,
    //       filterCondition:{
    //         ...tableState.filterCondition ,
    //         page:getTablePage(tableData.page,tableData.size,tableData.total) //filterCondition.page与tableData.page保持同步
    //       },
    //       tableData ,
    //       selectedRowKeys:tableState.selectedRowKeys.filter(
    //         (key)=>tableData.list.map(
    //           (record)=>record[tableState.tableConfig.rowKey]).includes(
    //             key
    //           )), //过滤掉当前表格不存在的selectedRowKeys
    //       isFetching:false
    //     }) ;
    //   }else{ //若返回为空,则按异常处理
    //     setTableState({
    //       ...tableState ,
    //       isFetching:false
    //     });
    //   }
    // }catch(error){ //异常处理
    //   console.error(error) ;
    //   setTableState({
    //     ...tableState ,
    //     isFetching:false
    //   });
    // }
    // /**** fetch END */
  }
  return [
    tableState ,
    updateTableState ,
    setFilterCondition ,
    setSelectedRowKeys
  ] ;
}


/*
携带form实例的wrapper\HOC
(form实例由自定义函数getFormInstances提供)
*/
function withTableStateAndActions<TComponentProps,TFilterCondition> (
  TheComponent:React.ComponentClass,
  getTableStateAndActions:()=>{[key:string]:TTableStateAndActions<TFilterCondition>}
) {
  return (props:TComponentProps)=>{
    return (
      <TheComponent
        {...props}
        {...getTableStateAndActions()}
      />
    )
  }
}

export default TableTemplate ;
export {
  useTableState ,
  withTableStateAndActions
}