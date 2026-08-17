
// import { Users, UserCheck, UserX, Clock } from "lucide-react";

// export default function UserStats() {
//   const stats = [
//     { title: "Total Users", value: 248, icon: <Users size={24} />, color: "blue" },
//     { title: "Active Users", value: 201, icon: <UserCheck size={24} />, color: "green" },
//     { title: "Suspended", value: 17, icon: <UserX size={24} />, color: "red" },
//     { title: "Pending", value: 30, icon: <Clock size={24} />, color: "amber" },
//   ];

//   return (
//     <div className="users-stats">
//       {stats.map((item) => (
//         <div className="user-stat-card" key={item.title}>
//           <div className={`user-stat-icon icon-${item.color}`}>
//             {item.icon}
//           </div>
//           <div className="stat-info">
//             <h3>{item.value}</h3>
//             <p>{item.title}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }