import React, { useState } from 'react';
import { X, Calendar, Clock, User, MessageSquare, Check, Sparkles, Phone, ExternalLink } from 'lucide-react';

import { ServiceItem } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
  brandName?: string;
  services?: ServiceItem[];
  initialServiceName?: string;
}

const FALLBACK_SERVICES: ServiceItem[] = [
  { id: 'asesoria', name: 'Asesoría Personalizada', duration: '45 min', price: '$50 USD', description: 'Consultoría estratégica 1 a 1', icon: '💼', active: true },
  { id: 'consulta', name: 'Consulta / Turno General', duration: '30 min', price: '$30 USD', description: 'Dudas y diagnóstico rápido', icon: '🗓️', active: true },
  { id: 'presupuesto', name: 'Presupuesto de Proyecto', duration: '30 min', price: 'Gratis', description: 'Evaluación personalizada sin costo', icon: '📊', active: true },
  { id: 'virtual', name: 'Reunión Virtual (Online)', duration: '45 min', price: '$45 USD', description: 'Videollamada en vivo', icon: '💻', active: true },
  { id: 'presencial', name: 'Turno Presencial', duration: '60 min', price: '$65 USD', description: 'Encuentro presencial', icon: '📍', active: true },
];

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:30',
  '17:30',
  '18:30',
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber = '5548999053493',
  brandName = 'Atención al Cliente',
  services,
  initialServiceName,
}) => {
  // Available active services
  const availableServices: ServiceItem[] = React.useMemo(() => {
    if (services && services.length > 0) {
      const activeList = services.filter((s) => s.active !== false);
      if (activeList.length > 0) return activeList;
    }
    return FALLBACK_SERVICES;
  }, [services]);

  // Clean phone number (only digits)
  const cleanNumber = whatsappNumber.replace(/\D/g, '') || '5548999053493';

  // Today as minimum date string YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Tomorrow
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  // State
  const defaultSelected = initialServiceName || (availableServices[0] ? availableServices[0].name : 'Consulta General');
  const [selectedService, setSelectedService] = useState(defaultSelected);
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync if initialServiceName changes or availableServices change
  React.useEffect(() => {
    if (initialServiceName) {
      setSelectedService(initialServiceName);
    } else if (availableServices.length > 0 && !availableServices.some(s => s.name === selectedService)) {
      setSelectedService(availableServices[0].name);
    }
  }, [initialServiceName, availableServices]);

  if (!isOpen) return null;

  // Format date readable (e.g. "Viernes, 14 de Noviembre")
  const formatDateReadable = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setValidationError('Por favor ingresa tu nombre completo.');
      return;
    }

    setValidationError('');

    // Find matching service for price details
    const matchedService = availableServices.find((s) => s.name === selectedService);

    // Format WhatsApp message
    const lines = [
      `👋 *¡Hola ${brandName}! Deseo agendar un turno:*`,
      ``,
      `💼 *Servicio:* ${selectedService}`,
    ];

    if (matchedService?.price) {
      lines.push(`💵 *Tarifa estimada:* ${matchedService.price}`);
    }
    if (matchedService?.duration) {
      lines.push(`⏱️ *Duración estimada:* ${matchedService.duration}`);
    }

    lines.push(`📅 *Fecha solicitada:* ${formatDateReadable(selectedDate)} (${selectedDate})`);
    lines.push(`⏰ *Horario preferido:* ${selectedTime} hs`);
    lines.push(`👤 *Nombre del solicitante:* ${clientName.trim()}`);

    if (clientPhone.trim()) {
      lines.push(`📱 *Teléfono de contacto:* ${clientPhone.trim()}`);
    }

    if (clientNotes.trim()) {
      lines.push(`📝 *Detalles / Motivo:* ${clientNotes.trim()}`);
    }

    lines.push(``);
    lines.push(`_Enviado desde el sistema de reservas del BioLink._`);

    const fullMessage = lines.join('\n');
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(fullMessage)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Reserva de Turno por WhatsApp</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Directo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona servicio, fecha y horario. Te confirmamos de inmediato.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleConfirmBooking} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Step 1: Select Service */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. Elige el Servicio o Consulta
              </label>
              <a
                href="/servicios.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors underline underline-offset-2"
              >
                <span>Ver catálogo y tarifas</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableServices.map((srv) => {
                const isSelected = selectedService === srv.name;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedService(srv.name)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-xl shrink-0">{srv.icon || '💼'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{srv.name}</span>
                          {srv.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              {srv.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          {srv.duration && <span>⏱️ {srv.duration}</span>}
                          {srv.price && (
                            <span className="font-semibold text-emerald-400 font-mono">
                              {srv.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date & Quick Select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>2. Selecciona la Fecha</span>
              <span className="text-[11px] text-slate-400 font-normal">{formatDateReadable(selectedDate)}</span>
            </label>

            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedDate === today
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(tomorrow)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedDate === tomorrow
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                Mañana
              </button>
            </div>

            <div className="relative">
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Step 3: Time Slot Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>3. Elige Horario Preferido</span>
              <span className="text-[11px] text-emerald-400 font-mono">{selectedTime} hs</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Client Info */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              4. Tus Datos de Contacto
            </label>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Tu Nombre y Apellido *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Martínez"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tu WhatsApp / Teléfono (opcional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Ej: +54 9 11 2345-6789"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Motivo o Consulta (opcional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: Información de precios"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              ⚠️ {validationError}
            </div>
          )}

          {/* Live Preview of WhatsApp message */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Previsualización del Mensaje para WhatsApp:
            </span>
            <div className="text-[11px] font-mono text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
              👋 <strong>¡Hola {brandName}! Deseo agendar un turno:</strong><br />
              💼 Servicio: {selectedService}<br />
              📅 Fecha: {formatDateReadable(selectedDate)}<br />
              ⏰ Horario: {selectedTime} hs<br />
              👤 Solicitante: {clientName.trim() || '[Tu Nombre]'}
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-slate-950" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.96.549 1.764.846 2.796.846 3.182 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.713.064-2.12-.516-1.782-.736-2.936-2.56-3.025-2.679-.089-.119-.724-.963-.724-1.836 0-.873.455-1.303.617-1.478.163-.176.356-.22.474-.22.119 0 .237 0 .341.006.11.006.257-.042.403.31.15.362.516 1.258.562 1.349.046.092.076.199.015.32-.06.12-.091.196-.181.301-.09.106-.189.237-.27.318-.09.091-.184.19-.079.37.105.18.468.772.999 1.246.685.611 1.264.8 1.444.89.18.09.285.076.39-.045.105-.121.45-.526.57-.706.12-.18.24-.15.405-.09.165.06 1.05.495 1.23.585.18.09.3.135.345.21.045.075.045.435-.099.84z"/>
              </svg>
              <span>📲 Confirmar y Enviar Turno por WhatsApp</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <span>Número: +{cleanNumber}</span>
              <a
                href="./turnos.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>Ver página completa</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
