'use client';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const HomeInputField = ({ ...props }: InputProps) => {
  return (
    <div>
      <input
        className="w-full p-4 rounded-[40px] border border-[rgba(205,205,205,1)] flex items-center justify-center placeholder:text-[rgba(132,132,132,1)] placeholder:font-medium placeholder:text-base placeholder:leading-[15px]"
        {...props}
      />
    </div>
  );
};

export default HomeInputField;
