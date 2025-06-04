'use client'
import React from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jan", patients: 400, evaluations: 240, surgery: 180 },
  { name: "Feb", patients: 300, evaluations: 200, surgery: 150 },
  { name: "Mar", patients: 450, evaluations: 280, surgery: 200 },
  { name: "Apr", patients: 500, evaluations: 320, surgery: 220 },
]

export function PatientStats() {
  return (
    <div>
      <h3 className="font-[SairaSemibold] md:text-xl text-2xl mb-4">Patient Statistics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Bar dataKey="patients" fill="#276749" radius={[4, 4, 0, 0]} />
          <Bar dataKey="evaluations" fill="#44d93f" radius={[4, 4, 0, 0]} />
          <Bar dataKey="surgery" fill="#b8ffb5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}