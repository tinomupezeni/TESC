// src/pages/auth/Signup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock } from "lucide-react";
import { bg_image } from "@/components/layout/logo"; // Make sure bg_image is a URL or imported asset

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add signup logic
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_image})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />{" "}
      {/* Overlay for readability */}
      <Card className="w-full max-w-md shadow-2xl rounded-2xl relative z-10">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Create an Account
            </h1>
            <p className="text-gray-500 text-sm">
              TESC Student Records & Statistics
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
