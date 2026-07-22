import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useEmployees, useCreateEmployee, useVentures } from "@/lib/api-hooks";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team — Thenam ERP" }] }),
  component: TeamPage,
});

function TeamPage() {
  const { data: employees, isLoading } = useEmployees();
  const { data: ventures } = useVentures();
  const createEmployee = useCreateEmployee();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [role, setRole] = useState("Developer");
  const [ventureId, setVentureId] = useState("");
  const [salary, setSalary] = useState("50000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !ventureId) {
      toast.error("Please fill in all required fields, including assigning a venture.");
      return;
    }

    createEmployee.mutate({
      name,
      email,
      department,
      role,
      venture: ventureId,
      salary: Number(salary)
    }, {
      onSuccess: () => {
        toast.success("Employee added successfully");
        setOpen(false);
        setName("");
        setEmail("");
        setDepartment("Engineering");
        setRole("Developer");
        setVentureId("");
        setSalary("50000");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to add employee");
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Team"
        subtitle="People across all ventures."
        actions={
          <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" /> Add employee
          </Button>
        }
      />

      <SectionCard title="Employees" description={`${employees?.length || 0} employees found`}>
        {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading team data...</div>
        ) : !employees || employees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-4"
            >
              <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-emerald text-white shadow-elevated">
                <Users className="h-9 w-9" />
              </div>
              <div>
                <p className="text-lg font-semibold">No team members yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add employees to track performance, roles and departments.
                </p>
              </div>
              <Button className="rounded-xl gradient-emerald text-white gap-1.5 mt-2 cursor-pointer" onClick={() => setOpen(true)}>
                <UserPlus className="h-4 w-4" /> Add employee
              </Button>
            </motion.div>
        ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((emp: any) => (
                    <div key={emp._id} className="p-4 rounded-xl bg-slate-900 border border-border flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                             {emp.avatar ? <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover"/> : <Users className="h-6 w-6 text-slate-400" />}
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground">{emp.name}</h4>
                            <p className="text-sm text-muted-foreground">{emp.role} • {emp.department}</p>
                            <p className="text-[10px] text-primary mt-0.5 font-medium">{emp.venture?.name || "No Venture"}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-slate-950 text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new team member to a specific venture.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="empName">Full Name</Label>
              <Input id="empName" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1.5 rounded-xl border-border" required />
            </div>
            <div>
              <Label htmlFor="empEmail">Email Address</Label>
              <Input id="empEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com" className="mt-1.5 rounded-xl border-border" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="empDept">Department</Label>
                <select
                  id="empDept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Design">Design</option>
                </select>
              </div>
              <div>
                <Label htmlFor="empRole">Role</Label>
                <select
                  id="empRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
                >
                  <option value="Developer">Developer</option>
                  <option value="Manager">Manager</option>
                  <option value="Designer">Designer</option>
                  <option value="Executive">Executive</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="empVenture">Venture</Label>
                <select
                  id="empVenture"
                  value={ventureId}
                  onChange={(e) => setVentureId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="empSalary">Salary</Label>
                <Input id="empSalary" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="mt-1.5 rounded-xl border-border" required />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createEmployee.isPending} className="rounded-xl gradient-royal text-white hover:opacity-90">
                {createEmployee.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </PageContainer>
  );
}
