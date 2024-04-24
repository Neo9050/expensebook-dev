import React, { useState } from 'react';
import { loading_icon } from '../../assets/icon';

export default function Button(props) {
  

  const text = props.text;
  const onClick = props.onClick;
  const variant = props.variant ?? 'fit';
  const disabled = props.disabled ?? false;
  const active = props.active ?? false;
  const loading = props.loading ?? false

  const handleClick = (e) => {
    if ( !disabled && !loading) {
    // if (!disabled && !loading) {
      onClick(e);

      // Assuming the onClick function might trigger an asynchronous operation.
      // After the operation is done, set loading back to false.
      // You may need to adjust this based on your actual use case.
      // Example:
      // async onClickHandler() {
      //   // Some asynchronous operation
      //   await yourAsyncOperation();
      //   setLoading(false);
      // }
    } else {
      console.log('disabled or already loading',disabled);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`${variant === 'fit' ? 'w-fit' : 'w-full'} ${
          disabled 
            ? 'hover:bg-indigo-400  hover:text-gray-400 bg-indigo-400 text-gray-400  cursor-not-allowed '
            : 'hover:bg-indigo-500  text-white cursor-pointer'
        } h-12 px-8 py-4 bg-indigo-600 rounded-[32px] justify-center items-center gap-2 inline-flex`}
      >
        {loading && active ? (
          <img src={loading_icon} className="animate-spin w-8 h-8" />
        ) : (
          <div className="w-full h-5 text-center text-white-100 text-base font-medium font-cabin">
            {text}
          </div>
        )}
      </div>
    </>
  );
}
// export default function Button(props){

//     const text = props.text
//     const onClick = props.onClick
//     const variant = props.variant?? 'fit'
//     const disabled = props.disabled?? false
//     console.log(disabled)

//     const handleClick = (e)=>{
//         if(!disabled){
//             onClick(e)
//         }
//         else{
//             console.log('disabled')
//         }
//     }

//     return(<>
//     <div
//         onClick={handleClick} 
//         className={`${variant=='fit'? 'w-full':'w-full' } ${disabled? 'hover:bg-indigo-400 hover:text-gray-400 bg-indigo-400 text-gray-400 cursor-not-allowed': 'hover:bg-indigo-500  text-white cursor-pointer' } h-12 px-8 py-4 bg-indigo-600 rounded-[32px] justify-center items-center gap-2 inline-flex cursor-pointer`}>
//         <div className="w-full h-5 text-center text-white-100 text-base font-medium font-cabin">{text}</div>
//     </div>
//     </>)
// }