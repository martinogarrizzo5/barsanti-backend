import { ClassNamesConfig, GroupBase } from "react-select";

export const dropDownStyles: ClassNamesConfig<any, false, GroupBase<any>> = {
  container: state => "",
  control: state => "h-full",
  valueContainer: state => "",
  option: ({ isSelected, isFocused }) =>
    isSelected ? "!bg-primary" : "bg-white",
  noOptionsMessage: state => "",
  placeholder: state => "!text-placeholder",
};
