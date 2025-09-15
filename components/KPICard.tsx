'use client'

import AnimatedCounter from './AnimatedCounter'

interface KPICardProps {
  value: number
  title: string
  description: string
  prefix?: string
  suffix?: string
}

export default function KPICard({
  value,
  title,
  description,
  prefix = '+',
  suffix = ''
}: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-number">
        <AnimatedCounter
          end={value}
          prefix={prefix}
          suffix={suffix}
          duration={2000}
          className="kpi-value-text"
        />
      </div>
      <h3 className="kpi-title">{title}</h3>
      <p className="kpi-description">{description}</p>
      
      <style jsx>{`
        .kpi-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .kpi-number {
          margin-bottom: 1rem;
        }
        
        .kpi-number :global(.kpi-value-text) {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00A651, #004A99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        
        .kpi-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }
        
        .kpi-description {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .kpi-card {
            padding: 1.5rem;
          }
          
          .kpi-number :global(.kpi-value-text) {
            font-size: 2.5rem;
          }
          
          .kpi-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  )
}