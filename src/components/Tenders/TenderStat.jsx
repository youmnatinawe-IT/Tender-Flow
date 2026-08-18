// import {
//   FileText,
//   Award,
//   Scale,
//   Megaphone,
//   FileEdit,
//   XCircle,
// } from "lucide-react";

// export default function TenderStats() {
//   const stats = [
//     {
//       title: "Total",
//       value: 148,
//       icon: <FileText size={20} />,
//       type: "total", // 👈 سيتحول لكلاس: stat-icon total
//     },
//     {
//       title: "Published",
//       value: 42,
//       icon: <Megaphone size={20} />,
//       type: "published", // 👈 سيتحول لكلاس: stat-icon published
//     },
//     {
//       title: "Evaluating",
//       value: 18,
//       icon: <Scale size={20} />,
//       type: "evaluating", // 👈 سيتحول لكلاس: stat-icon evaluating
//     },
//     {
//       title: "Draft",
//       value: 18,
//       icon: <FileEdit size={20} />,
//       type: "draft", // 👈 سيتحول لكلاس: stat-icon draft
//     },
//     {
//       title: "Cancelled",
//       value: 18,
//       icon: <XCircle size={20} />,
//       type: "cancelled", // 👈 سيتحول لكلاس: stat-icon cancelled
//     },
//     {
//       title: "Awarded",
//       value: 26,
//       icon: <Award size={20} />,
//       type: "awarded", // 👈 سيتحول لكلاس: stat-icon awarded
//     },
//   ];

//   return (
//     <div className="tender-stats">
//       {stats.map((item, index) => (
//         <div className="tender-stat-card" key={index}>
//           {/* دمج كلاس الحالة مع الكلاس الأساسي هنا */}
//           <div className={`stat-icon ${item.type}`}>
//             {item.icon}
//           </div>

//           <div>
//             <h2>{item.value}</h2>
//             <p>{item.title}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }