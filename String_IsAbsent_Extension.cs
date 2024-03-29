using System;
namespace WebPad;
public static class String_IsAbsent_Extension
{
    public static bool IsAbsent(this String value, string to_check)
    {
        return value.Contains(to_check) == false;
    }
}