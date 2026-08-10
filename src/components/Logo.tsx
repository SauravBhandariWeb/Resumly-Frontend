import { cls } from '@/lib/utils';



export default function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  
  

  return (
    <div className={cls('flex items-center gap-2.5', className)} 
      
    >

      <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-soft flex items-center justify-center">
       
     
        <img src="/Logo.png" className='w-[100%] h-[100%] object-cover  ' />
   
      
      </div >
      {showText && <span className="font-display text-xl font-bold tracking-tight text-ink-900 dark:text-white" >Resumly</span>}
    </div>
  );
}
// Landing
// genrate resumly logo for my website make sure not not copyrighted
