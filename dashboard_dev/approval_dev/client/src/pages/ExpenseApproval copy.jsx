/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/display-name */
import React,{ useState, useEffect} from "react";
import {BrowserRouter as Router, useParams} from 'react-router-dom'
import Icon from "../components/common/Icon";
import { titleCase } from "../utils/handyFunctions";
import Button from "../components/common/Button";
import Error from "../components/common/Error";
import PopupMessage from "../components/common/PopupMessage";
import { double_arrow, calender, cab_purple as cab_icon, airplane_1 as airplane_icon} from "../assets/icon";
import { dummyExpenseData } from "../dummyData/travelExpenseHeader";
import Select from "../components/common/Select";
import ActionButton from "../components/common/ActionButton";
import { approveTravelExpense, getTravelExpenseDataApi, rejectTravelExpense } from "../utils/api";


const rejectionOptions=['Too Many Violations', 'Budget Constraints','Insufficient Documents','Upcoming Project Deadline']

export default function () {
  //get travel request Id from params
    const {tenantId,empId,tripId ,expenseHeaderId} = useParams()
    
    const [showPopup, setShowPopup] = useState(false)
    const [message, setMessage] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [travelRequestStatus, setTravelRequestStatus] = useState('pending approval')

    const [isLoading, setIsLoading] = useState(true)
    const [loadingErrMsg, setLoadingErrMsg] = useState(null)
    const [expenseData , setExpenseData]=useState(null);
    const [alreadyBookedExpense,setAlreadyBookedExpense]=useState(null);
    const [expenseAmtDetails , setExpenseAmtDetails]=useState({})
    const [lineItems,setLineItems]=useState(null)
    const [selectedRejReason, setSelectedRejReason]=useState(null)
    const [error , setError] = useState({set: false , message:""})
     

const paramsElement = {tenantId, empId,tripId,expenseHeaderId}


const [actionData , setActionData]= useState({})

    const handleModalVisible = (action) => {
        console.log('prams',paramsElement)
        setShowModal((prev) => (!prev));  
        setActionData({action,...paramsElement})
        
    }
    
   

   const handleConfirm=async()=>{
    const {action,tenantId,empId,tripId,expenseHeaderId} = actionData
    console.log('action data ', actionData)
    let api;
    if(action==='approve-expense'){
        api= approveTravelExpense(tenantId, empId, tripId, expenseHeaderId)
    }else if (action ==='reject-expense'){
        api = rejectTravelExpense(tenantId,empId,tripId,expenseHeaderId,selectedRejReason)
    }

    let validConfirm = true
    
     if((action === 'reject-expense' && selectedRejReason === null)){
      setError({set:true,message:'Please select a reason'})
      validConfirm =false
     }else{
      setError({set:false,message:''})
     }
    
    if(validConfirm){
      try {
        setIsLoading(true);
        // const response = await postTravelPreference_API({ tenantId, empId, formData });
       const response = await approveTravelExpense()
       console.log('responsemessage',response)
       setLoadingErrMsg(response)
       
       
        setTimeout(() => {setIsLoading(false);setLoadingErrMsg(null)},10000);
    //   window.location.reload()
      
      } catch (error) {
        setLoadingErrMsg(`Please retry again : ${error.message}`); 
        setTimeout(() => {setIsLoading(false);setLoadingErrMsg(null)},2000);
    
      }
      handleModalVisible()
      setActionData({})
      setSelectedRejReason(null)
    }

    
   }



    


    
    
//this is get data api

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await getTravelExpenseDataApi(tenantId, empId, tripId, expenseHeaderId);
            setExpenseData(response?.data?.expenseReport);  
            setIsLoading(false);
            console.log(response.data)
            console.log('expense data for approval fetched.');
          } catch (error) {
            console.log('Error in fetching expense data for approval:', error.message);
            setLoadingErrMsg(error.message);
            setTimeout(() => {setLoadingErrMsg(null);setIsLoading(false)},5000);
          }
        };
    
        fetchData(); 
    
      }, [tenantId,empId,tripId ,expenseHeaderId]);
      console.log('expense data ',expenseData)

    // useEffect(()=>{
    //     setExpenseData(dummyExpenseData) 
    //   },[expenseData])
    
      useEffect(()=>{
        setAlreadyBookedExpense(expenseData?.alreadyBookedExpenseLines[0])
        setExpenseAmtDetails(expenseData?.expenseAmountStatus)
        setLineItems(expenseData?.expenseLines)
        setIsLoading(false)
        console.log(expenseData)
      },[expenseData])

      console.log('already booked expense',alreadyBookedExpense)
      console.log('expenseAmtDetails',expenseAmtDetails)

      const categories = ['flights', 'cabs', 'hotels', 'trains', 'buses'];

      
    
  
   
  

  ///for  already booked expenses start
 
  let totalAllCategories = 0;

  const calculateTotalAmount = (category)=>{
    if(alreadyBookedExpense[category]){
      const totalAmount = alreadyBookedExpense[category].reduce(
        
        (accumlator , item)=> accumlator + parseFloat(item.amount),0 );
        return totalAmount.toFixed(2)
    }
    return "00.00";
  }

  // for already booked expense ended


  const [groupedExpenses, setGroupedExpenses] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);

  // Group expenses by category and calculate the total amount for each category
  const groupExpenses = () => {
    const grouped = lineItems && lineItems.reduce((accumulator, expense) => {
      const { categoryName, 'Total Amount': totalAmount, 'Total Fair': totalFair } = expense;

      // Use a generic property name ('total') to store the total amount
      const total = parseFloat(totalAmount) || parseFloat(totalFair) || 0;

      if (!accumulator[categoryName]) {
        accumulator[categoryName] = {
          categoryName,
          totalAmount: total,
        };
      } else {
        accumulator[categoryName].totalAmount += total;
      }

      return accumulator;
    }, {});

    setGroupedExpenses(grouped);
    // Calculate the grand total
  const allTotals = Object.values(grouped).map(category => category.totalAmount);
  const grandTotal = allTotals.reduce((sum, total) => sum + total, 0);
  setGrandTotal(grandTotal);
  };

  //Call groupExpenses when the component mounts
  useEffect(() => {
   lineItems &&  groupExpenses();
  }, [lineItems]);

      
    // useEffect(()=>{
    //     if(showCancelModal){
    //         document.body.style.overflow = 'hidden'
    //     }
    //     else{
    //         document.body.style.overflow = 'auto'
    //     }
    // },[showCancelModal])



      
  
      
 
      

      

  return <>
      {isLoading && <Error message={loadingErrMsg}/>}
      {!isLoading && 
        <div className="w-full h-full relative bg-white-100 sm:px-[120px] px-6   py-12 select-none">
        {/* app icon */}
        <div className='w-full flex justify-center  md:justify-start lg:justify-start'>
            <Icon/>
        </div>

        {/* Rest of the section */}
        <div className="w-full h-full mt-10  font-cabin tracking-tight">
            <div className='flex justify-between items-center sm:flex-row flex-col py-4'>
                <p className="text-2xl text-start text-neutral-600 capitalize mb-5">{expenseData?.tripPurpose}</p>
                
                {travelRequestStatus === 'pending approval' && <div className="flex  gap-4">
                    <div>
                        <ActionButton text={'Approve'} onClick={()=>handleModalVisible("approve-expense")}/>
                    </div>
                    <div >
                        <ActionButton text={'Reject'}  onClick={()=>handleModalVisible("reject-expense")}/>
                    </div>
                    
                </div>}
             
            </div>
            <div className="flex flex-row justify-between">
            <div>
                <div className="flex gap-2 font-cabin text-xs tracking-tight">
                    <p className="w-[100px] text-neutral-600">Requested By:</p>
                    <p className="text-neutral-700">{expenseData?.createdBy?.name}</p>
                </div>
                <div className="flex gap-2 font-cabin text-xs tracking-tight">
                    <p className="w-[100px] text-neutral-600">Trip Number:</p>
                    <p className="text-neutral-700">{expenseData?.tripNumber?? "not available"}</p>
                </div>
                <div className="flex gap-2 font-cabin text-xs tracking-tight">
                    <p className="w-[100px] text-neutral-600">Expense Number:</p>
                    <p className="text-neutral-700">{expenseData?.expenseHeaderNumber}</p>
                </div>
                {expenseAmtDetails?.totalCashAmount>0  && <div className="flex gap-2 font-cabin text-xs tracking-tight">
                    <p className="w-[100px] text-neutral-600">Total CashAdvance:</p>
                    <p className="text-neutral-700">{expenseAmtDetails?.totalCashAmount ?? "-"}</p>
                </div>}
                {/* <div className="flex gap-2 font-cabin text-xs tracking-tight">
                    <p className="w-[100px] text-neutral-600">Raised For:</p>
                    <p className="text-neutral-700">{expenseData.createdFor?.name??'Self'}</p>
                </div>
                <div className="flex gap-2 font-cabin text-xs tracking-tight">
                    <p className="w-[100px] text-neutral-600">Team-members:</p>
                    <p className="text-neutral-700">{expenseData.teamMembers.length>0 ? expenseData.teamMembers.map(member=>`${member.name}, `) : 'N/A'}</p>
                </div> */}
            </div>
            <div>
            {/* <div className="flex gap-2 font-cabin text-xs tracking-tight">
                    
                   
                    {
                        formData.travelExpenseAllocation.map((item,index)=>(
                           
                            <React.Fragment key={index}>
                                <div className="w-[500px]">
                                <div className="">
                                    <h1>Allocation Centre</h1>
                                    

                                </div>
                                <div>
                                    <h2>{item.headers}</h2>
                                    

                                </div>
                                </div>

                            </React.Fragment>
                            

                        ))
                    }
           </div> */}

            </div>
            </div>
           
        
            <hr/>

            <div className=' '>

<div>
  {alreadyBookedExpense && categories.map((category) => {
    const totalAmount = calculateTotalAmount(category);
   
    if (parseFloat(totalAmount) > 0) {
      totalAllCategories += parseFloat(totalAmount);
      return (
        <div key={category} className="p-2 border-b-[1px] border-neutral-300">
          <div className="text-lg text-Inter font-medium mb-1 text-neutral-600">{titleCase(category)}</div>
          <div className="text-base text-neutral-400 ">{`${totalAmount}`}</div>
        </div>
      );
    }
    return null;
  })}
  
  {totalAllCategories > 0 && (
    <div className="px-4 py-2 border-b-[1px] border-neutral-300 flex flex-row justify-between items-center bg-slate-100">
      <div className="text-lg text-Inter font-semibold mb-1 text-neutral-600">Total Already Booked Amount</div>
      <div className="text-base text-gray-600 font-medium pl-4">{`${totalAllCategories.toFixed(2)}`}</div>
    </div>
  )} 
</div> 
<div>
  {Object.values(groupedExpenses).map((category) => (
    <div key={category.categoryName} className="p-2 border-b">
      <div className="text-lg text-Inter font-medium mb-1 text-neutral-600 capitalize">{(category.categoryName)}</div>
      <div className="text-base text-neutral-400 ">{`${category.totalAmount.toFixed(2)}`}</div>
    </div>
  ))}

</div>  
<div className="px-4 py-2 border-b-[1px] border-neutral-300 flex flex-row justify-between items-center bg-slate-100">
      <div className="text-lg text-Inter font-semibold mb-1 text-neutral-600">Total Travel Expense Amount</div>
      <div className="text-base text-gray-600 font-medium pl-4">{`${grandTotal.toFixed(2)}`}</div>
    </div>      
{expenseAmtDetails?.totalCashAmount > 0 && <div className="px-4 py-2 border-b-[1px] border-neutral-300 flex flex-row justify-between items-center ">
      <div className="text-lg text-Inter font-medium mb-1 text-neutral-600">Issued Cash Advance Amount</div>
      <div className="text-base text-gray-600 font-medium pl-4 w-auto ">- {expenseAmtDetails?.totalCashAmount.toFixed(2) ?? "-"}</div>
</div>  }    
{expenseAmtDetails?.totalPersonalExpense > 0 && <div className="px-4 py-2 border-b-[1px] border-neutral-300 flex flex-row justify-between items-center ">
      <div className="text-lg text-Inter font-medium mb-1 text-neutral-600">Personal Expense Amount</div>
      <div className="text-base text-gray-600 font-medium pl-4">- {expenseAmtDetails?.totalPersonalExpense.toFixed(2) ?? "-"}</div>
</div>  }    
 <div className={`px-4 py-2 border-b-[1px] border-neutral-300 flex flex-row justify-between items-center  ${expenseAmtDetails?.remainingCash<0 ? 'text-green-200 bg-green-50': 'text-red-500 bg-red-50'}`}>
            <div className={`text-lg text-Inter font-medium mb-1  `}>
            {expenseAmtDetails?.remainingCash<0
            ? `No recovery needed. Amount has to Reimburse.`
            : 'Remaining Amount has to Recover'}
            </div>
      <div className="text-base  font-medium pl-4"> {(expenseAmtDetails?.remainingCash.toFixed(2)) ?? "-"}</div>
</div>     
      </div>





     



            {/* {showConfimationForCancllingTR && <div className="fixed overflow-hidden max-h-4/5 flex justify-center items-center inset-0 backdrop-blur-sm w-full h-full left-0 top-0 bg-gray-800/60 scroll-none">
                <div className='z-10 max-w-4/5 w-2/5 min-h-4/5 max-h-4/5 scroll-none bg-white-100  rounded-lg shadow-md'>
                    <div className="p-10">
                        <p className="text-xl font-cabin">Please select reasons for cancelling this travel Request</p>
                        <Select 
                            options={rejectionReasonOptions}
                            onSelect={onReasonSelection}
                            placeholder='Please select reason for rejection'
                        />
                        <div className="flex mt-10 justify-between">
                            <Button variant='fit' text='Cancel' onClick={handleReject} />
                            <Button variant='fit' text='Confirm' onClick={()=>setShowConfirmationForCancellingTr(false)} />
                        </div>
                    </div>
                </div>
                </div>
            } */}
            {showModal && <div className="fixed overflow-hidden max-h-4/5 flex justify-center items-center inset-0 backdrop-blur-sm w-full h-full left-0 top-0 bg-gray-800/60 scroll-none">
                <div className='z-10 max-w-4/5 sm:w-2/5 w-auto min-h-4/5 max-h-4/5 scroll-none bg-white-100   rounded-lg shadow-md'>
                    <div className="p-10">
                        <p className="text-xl text-center font-cabin text-neutral-600 ">Click on confirm for <span className="capitalize text-indigo-600">{actionData?.action}!</span></p>
                        { (actionData?.action === 'reject-expense') &&
                        <div className="mt-8 flex justify-center">
                        <Select 
                            currentOption={selectedRejReason}
                            title='Please select the reason for reject'
                            placeholder='Select Reason'
                            options={rejectionOptions}
                            onSelect={(value)=>(setSelectedRejReason(value))}
                            error={error}
                        />
                        </div>}
                        <div className="flex md:flex-row flex-col mt-10 justify-between xl:px-10 px-0 gap-4 ">
                            <div className="md:w-fit w-full">
                            <Button  text='Cancel' onClick={()=>{handleModalVisible();setActionData({});setError(null)}} />
                            </div>
                            <div className="md:w-fit w-full">
                            <Button  text='Confirm' onClick={handleConfirm} />
                            </div>
                           
                        </div>
                    </div>
                </div>
                </div>
            }
        </div>
        
        {/* <div className="flex mt-10 flex-row-reverse">
            <Button text='Submit' onClick={handleSubmit}/>
        </div> */}
        </div>
      }
      <PopupMessage showPopup={showPopup} setShowPopup={setShowPopup} message={message}/>
  </>;
}

// function spitBoardingPlace(modeOfTransit){
//     if(modeOfTransit === 'Flight')
//         return 'Airport'
//     else if(modeOfTransit === 'Train')
//         return 'Railway station'
//     else if(modeOfTransit === 'Bus')
//         return 'Bus station'
// }

function spitImageSource(modeOfTransit){
    if(modeOfTransit === 'Flight')
        return airplane_icon
    else if(modeOfTransit === 'Train')
        return cab_icon
    else if(modeOfTransit === 'Bus')
        return cab_icon
}

function FlightCard({amount,from, to, date, time, travelClass, onClick, mode='Flight', showActionButtons, itnId, handleLineItemAction}){
    return(
    <div className="shadow-sm min-h-[76px] bg-slate-50 rounded-md border border-slate-300 w-full px-6 py-4 flex flex-col sm:flex-row gap-4 items-center sm:divide-x">
    <img src={spitImageSource(mode)} className='w-4 h-4' />
    <div className="w-full flex sm:block">
        <div className='mx-2 text-xs text-neutral-600 flex justify-between flex-col sm:flex-row'>
            <div className="flex-1">
                Total Amount  
            </div>
           

            
           
           
        </div>

        <div className="mx-2 text-sm w-full flex justify-between flex-col sm:flex-row">
           
            
           
            {/* <div className="flex-1">
                {time??'N/A'}
            </div> */}
            <div className="flex-1">
                {amount??'N/A'}
            </div>
        </div>
    </div>

    

    </div>)
}


// function CabCard_({from, to, date, time, travelClass, onClick, mode, isTransfer=false, showActionButtons, itnId}){
//     return(
//     <div className='Itinenery mb-4 bg-slate-50 mt-2' >
//         <div className='h-auto w-auto border border-slate-300 rounded-md'>     
//             <div className='flex flex-row py-3 px-2 divide-x'>
//                 <div className='flex items-center flex-grow divide-x '>
                
//                 <div className='flex items-start justify-start  flex-col shrink w-auto md:w-[200px] mr-4'>
//                     <div className='flex items-center justify-center mb-2'>
//                         <div className='pl-2'>
//                             <img src={cab_icon} alt="calendar" width={16} height={16} />
//                         </div>
//                         <span className="ml-2 tracking-[0.03em] font-cabin leading-normal text-gray-800 text-xs md:text-sm">
//                             Class : {travelClass}
//                         </span>
//                     </div>
                
//                     <div className='ml-4 max-w-[200px] w-auto'>
//                         <span className='text-xs font-cabin'>
//                             <div className='ml-4 max-w-[200px] w-auto'>
//                                 <span className='text-xs font-cabin'>{date}, {time}</span>
//                             </div>
//                         </span>
//                     </div>
//                 </div>
                
//                 <div className='flex grow  items-center justify-center '>
//                 <div className="flex text-xs text-gray-800 font-medium px-2 gap-4 justify-around">
                    
//                     <div className='flex flex-col text-lg font-cabin w-3/7  items-center text-center shrink '>
//                     <span className='text-xs'>Pick-Up</span>
//                     <span className='text-x'> {from} </span> 
//                     </div>
                    
//                     <div className='flex justify-center items-center w-1/7 min-w-[20px] min-h-[20px]'>
//                     <div className='p-4 bg-slate-100 rounded-full'>
//                             <img src={double_arrow} alt="double arrow" width={20} height={20} />
//                     </div>
//                     </div>
                
//                     <div className='flex flex-col text-lg font-cabin w-3/7 items-center text-center'>
//                     <span className='text-xs'>Drop-Off</span>
//                     <span className=''>{to}</span> 
//                     </div>

//                 </div>
//                 </div>
                
                
//                 </div>
                
                
//                 <div className='flex justify-end items-center px-8'>
                
//                 <div className={`flex items-center px-3 pt-[6px] pb-2 py-3 rounded-[12px] text-[14px] font-medium tracking-[0.03em] text-gray-600 cursor-pointer bg-slate-100  hover:bg-red-100  hover:text-red-900 `} onClick={onClick}>
//                     Cancel      
//                 </div>
//             </div>

//             </div>  
//         </div>
//     </div>
//     )
// }

function HotelCard({checkIn, checkOut, hotelClass, onClick, preference='close to airport,', showActionButtons, itnId, handleLineItemAction}){
    return(
    <div className="shadow-sm min-h-[76px] bg-slate-50 rounded-md border border-slate-300 w-full px-6 py-4 flex flex-col sm:flex-row gap-4 items-center sm:divide-x">
    <p className='font-semibold text-base text-neutral-600'>Hotel</p>
    <div className="w-full flex sm:block">
        <div className='mx-2 text-xs text-neutral-600 flex justify-between flex-col sm:flex-row'>
            <div className="flex-1">
                Check-In  
            </div>
            <div className="flex-1" >
                Checkout
            </div>
            <div className="flex-1">
                Class/Type
            </div>
            <div className='flex-1'>
                Site Preference
            </div>
        </div>

        <div className="mx-2 text-sm w-full flex justify-between flex-col sm:flex-row">
            <div className="flex-1">
                {checkIn}     
            </div>
            <div className="flex-1">
                {checkOut}     
            </div>
            <div className="flex-1">
                {hotelClass??'N/A'}
            </div>
            <div className='flex-1'>
                {preference??'N/A'}
            </div>
        </div>

    </div>

    {showActionButtons && 
    <div className={`flex items-center gap-2 px-3 pt-[6px] pb-2 py-3 rounded-[12px] text-[14px] font-medium tracking-[0.03em] text-gray-600 cursor-pointer bg-slate-100  hover:bg-red-100  hover:text-red-900 `} onClick={onClick}>
        <div onClick={()=>handleLineItemAction(itnId, 'approved')}>
            <ActionButton text={'approve'}/>
        </div>
        <div onClick={()=>handleLineItemAction(itnId, 'rejected')}>
            <ActionButton text={'reject'}/>   
        </div>   
    </div>}

    </div>)
}

function CabCard({from, to, date, time, travelClass, onClick, mode, isTransfer=false, showActionButtons, itnId, handleLineItemAction}){
    return(
    <div className="shadow-sm min-h-[76px] bg-slate-50 rounded-md border border-slate-300 w-full px-6 py-4 flex flex-col sm:flex-row gap-4 items-center sm:divide-x">
    <div className='font-semibold text-base text-neutral-600'>
    <img src={cab_icon} className='w-6 h-6' />
        <p className="text-xs text-neutral-500">{isTransfer? 'Transfer Cab': 'Cab'}</p>
    </div>
    <div className="w-full flex sm:block">
        <div className='mx-2 text-xs text-neutral-600 flex justify-between flex-col sm:flex-row'>
            <div className="flex-1">
                Pickup     
            </div>
            <div className="flex-1" >
                Drop    
            </div>
            <div className="flex-1">
                    Date
            </div>
            <div className="flex-1">
                Preffered Time
            </div>
            {!isTransfer && <div className="flex-1">
                Class/Type
            </div>}
        </div>

        <div className="mx-2 text-sm w-full flex justify-between flex-col sm:flex-row">
            <div className="flex-1">
                {from??'not provided'}     
            </div>
            <div className="flex-1">
                {to??'not provided'}     
            </div>
            <div className="flex-1">
                {date??'not provided'}
            </div>
            <div className="flex-1">
                {time??'N/A'}
            </div>
           {!isTransfer && <div className="flex-1">
                {travelClass??'N/A'}
            </div>}
        </div>
    </div>
    {showActionButtons && 
    <div className={`flex items-center gap-2 px-3 pt-[6px] pb-2 py-3 rounded-[12px] text-[14px] font-medium tracking-[0.03em] text-gray-600 cursor-pointer bg-slate-100  hover:bg-red-100  hover:text-red-900 `} onClick={onClick}>
        <div onClick={()=>handleLineItemAction(itnId, 'approved')}>
            <ActionButton text={'approve'}/>
        </div>
        <div onClick={()=>handleLineItemAction(itnId, 'rejected')}>
            <ActionButton text={'reject'}/>   
        </div>   
    </div>}
    </div>)
}

