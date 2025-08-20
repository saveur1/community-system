import { User } from '@/api/auth';
import {
  HiOutlineUsers,
  HiOutlineCollection,
} from "react-icons/hi";
import { FaRegComments } from "react-icons/fa";
import { RiMedicineBottleFill } from 'react-icons/ri';
import { MdBrokenImage } from 'react-icons/md';
import { TiMessages  } from 'react-icons/ti';
import { checkPermissions } from '@/utility/logicFunctions';

const summaryCards = (user: User | null) => {

    // Analytics cards
    if (checkPermissions(user, 'dashboard:analytics')) {
      return [
        {
          id: "feedbacks",
          title: "Feedbacks — Immunization",
          value: 345,
          delta: 20.3,
          icon: FaRegComments,
          iconBgColor: "bg-primary",
          period: "This Week",
        },
        {
          id: "users",
          title: "Registered Users",
          value: 1280,
          delta: -8.73,
          icon: HiOutlineUsers,
          iconBgColor: "bg-title",
          period: "This year",
        },
        {
          id: "active",
          title: "Active Surveys",
          value: 7,
          delta: 10.73,
          icon: HiOutlineCollection,
          iconBgColor: "bg-success",
          period: "This week",
        },
      ];
    }

    // Community Dashboard summary cards
    if(checkPermissions(user, "dashboard:community")){
      return [
        {
          id: "vaccinations",
          title: "Next Vaccinations",
          value: "27/9/2025",
          delta: NaN,
          icon: RiMedicineBottleFill,
          iconBgColor: "bg-primary",
          period: "",
        },
        {
          id: "feedback",
          title: "Your Feedbacks",
          value: 128,
          delta: -8.73,
          icon: TiMessages,
          iconBgColor: "bg-title",
          period: "This year",
        },
        {
          id: "active",
          title: "New Surveys",
          value: 7,
          delta: 10.73,
          note: "2 launched this month",
          icon: HiOutlineCollection,
          iconBgColor: "bg-success",
          period: "This week",
        },
      ];
    }
    
    // Default statistics cards
    return [
          {
            id: "vaccinations",
            title: "Received Vaccinations",
            value: 3450,
            delta: 20.3,
            note: "12 new this week",
            icon: RiMedicineBottleFill,
            iconBgColor: "bg-primary",
            period: "This Week",
          },
          {
            id: "vacciantions2",
            title: "Defective Vaccinations",
            value: 128,
            delta: -8.73,
            note: "5 new today",
            icon: MdBrokenImage,
            iconBgColor: "bg-title",
            period: "This year",
          },
          {
            id: "active",
            title: "Submitted Surveys",
            value: 7,
            delta: 10.73,
            note: "2 launched this month",
            icon: HiOutlineCollection,
            iconBgColor: "bg-success",
            period: "This week",
          },
        ];
}

export default summaryCards;