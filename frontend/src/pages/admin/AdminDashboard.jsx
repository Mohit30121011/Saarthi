import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-fraunces text-2xl text-saarthi-ink mb-5">Admin Dashboard</h1>
      <p className="text-sm text-saarthi-body">
        Manage the scheme catalog from <Link to="/admin/schemes" className="text-saarthi-green font-medium hover:underline">Schemes</Link>.
      </p>
    </div>
  )
}
